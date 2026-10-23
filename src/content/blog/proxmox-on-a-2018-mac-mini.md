---
title: 'Installing Proxmox VE 9 on a 2018 Mac mini (T2): everything that went wrong'
description: 'A black screen after GRUB, efi=noruntime aborting the installer, "filter did not match any device", and the rest of what it took to get Proxmox VE 9.2 onto a Macmini8,1 with a T2 chip.'
pubDate: 'Oct 22 2026'
---

I turned my 2018 Mac mini into a Proxmox host. It's a Macmini8,1: an i7-8700B, 64 GB of RAM, a 1 TB internal SSD behind Apple's T2 chip, and gigabit Ethernet on board. Under Proxmox that is a very good little server.

Getting Proxmox onto it took far more reboots than it should have. Most of the guides out there were written for older Proxmox releases or for Debian's installer, and one piece of their standard advice breaks the Proxmox VE 9.2 installer outright. So here's every wall I hit, with the exact error text, in case you're searching for one of them right now.

The short version, if you just want it working:

- Use a **wired USB keyboard and mouse**, plugged into the mini itself.
- Plug the monitor into **HDMI, not USB-C**.
- **Do not** add `efi=noruntime` to the kernel line.
- If you use an answer file, filter the network card by **interface name**, not MAC.

## Before you wipe macOS

The T2 holds settings that only macOS can reach, so do these first.

1. **Install every macOS update.** The T2's own firmware ships inside macOS updates. Once macOS is gone, the only way to update it is Apple Configurator on another Mac.
2. **Sign out of iMessage and your Apple Account.** That turns off Find My and Activation Lock.
3. **Open Startup Security Utility in recoveryOS.** Set Secure Boot to **No Security**, and allow booting from external media. Medium Security only boots Apple- or Microsoft-signed systems, so Proxmox needs No Security for good.

Getting into recoveryOS was its own problem. Command-R at power-on did nothing with a Bluetooth keyboard, or with a keyboard on the monitor's USB hub, because the Mac sees them too late. macOS can boot itself into recovery for one boot instead:

```bash
sudo nvram internet-recovery-mode=RecoveryModeDisk && sudo reboot
```

Have a **wired USB keyboard and a wired USB mouse** in the mini's own ports before you start. The boot picker (hold Option at power-on) and recoveryOS both need them, and there's no Bluetooth pairing at that point.

## The screen goes black after GRUB: use HDMI

My monitor was connected over USB-C. The boot picker showed up, GRUB showed up, and then the screen went black while the power light stayed on. I couldn't tell whether the installer was running, hung, or sitting on an error.

The Mac's firmware drives the USB-C display, which is why the picker and GRUB appear. Once Linux starts, it has to drive that port itself, through the Mac's Thunderbolt controller, and it doesn't. The HDMI port is wired straight to the Intel graphics, and Linux drives it fine.

**If your screen goes dark after GRUB, switch to HDMI before you try anything else.** Every other problem on this list was invisible until I did.

## Don't add efi=noruntime

Most T2 Linux guides tell you to boot the installer with `efi=noruntime`. With Proxmox 9.2 that gets you this, and then a `root@none` shell with nothing in `/tmp`:

```text
EFI boot mode detected, mounting efivars filesystem
mount: /sys/firmware/efi/efivars: fsopen() failed: operation not supported
dmesg(1) may have more information after failed mount system call
```

The installer's startup script, `/usr/sbin/unconfigured.sh`, sets `trap "err_reboot" ERR` on its first lines and then mounts efivarfs. That mount needs EFI runtime services, which `efi=noruntime` switches off. So the mount fails, the trap fires, and the whole installer aborts into a shell. Debian's installer has no such mount, which is why the advice works there.

Without the flag, Proxmox 9.2's kernel booted fine on the mini. `grub-install` also wrote the firmware boot entry without trouble:

```text
BootCurrent: 0000
BootOrder: 0000,0080
Boot0000* proxmox	HD(2,GPT,...)/File(\EFI\proxmox\shimx64.efi)
```

## The Wi-Fi errors are harmless

During boot you'll see:

```text
brcmf_pcie_setup: dongle setup failed
phy0: brcmf_fw_crashed: firmware has halted or crashed.
```

That's the Broadcom Wi-Fi chip. Its firmware lives in macOS, not in Linux. A wired server doesn't need Wi-Fi, so the install carries on.

## "filter did not match any device"

I installed with an answer file, so I could kick it off and walk away. My answer picked the network card by MAC address, using the MAC macOS had shown me for the Ethernet port. The install got through the filesystem step and then stopped:

```text
setting up network configuration
installation failed: filter did not match any device
auto-installation failed exit code 1
```

Under Linux the onboard port had a different MAC from the one I'd copied out of macOS. I still don't know why they differ. The port's name, `enp4s0`, comes from its PCI slot, so it's stable, and matching on it skips the MAC question entirely.

You don't need to rebuild the ISO for this. The failed install leaves you in a shell, with your answer saved at `/run/automatic-installer-answers`. Fix the filter in that file and rerun the installer:

```bash
# list each interface with its MAC
for i in /sys/class/net/*; do echo ${i##*/} $(cat $i/address); done

# point the filter at the interface name, then rerun
sed -i 's/ID_NET_NAME_MAC/INTERFACE/; s/\*<your-old-mac>/enp4s0/' /run/automatic-installer-answers
proxmox-auto-installer </run/automatic-installer-answers
```

When it finishes, pull the USB stick and type `exit`, and it reboots into Proxmox.

## Put the answer file on the ISO

Proxmox can fetch the answer file over HTTP instead. I tried that so I'd see a request arrive when the installer got going. But a fetch depends on DHCP and on reaching the server. When nothing arrived, I couldn't tell a hung kernel from a network problem.

For one machine, bake the answer into the ISO, so the install never touches the network. `proxmox-auto-install-assistant` is a Debian package, so it runs fine in a `debian:trixie` container if you're not on Proxmox already:

```bash
proxmox-auto-install-assistant prepare-iso proxmox-ve_9.2-1.iso \
  --fetch-from iso --answer-file answer.toml
```

The answer that worked for me, with my own details swapped out:

```toml
[global]
keyboard = "en-us"
country = "us"
fqdn = "pve2.example.lan"
mailto = "you@example.com"
timezone = "America/New_York"
root-password-hashed = "<output of mkpasswd -m sha-512>"
root-ssh-keys = ["ssh-ed25519 AAAA... you@desk"]
reboot-mode = "power-off"

[network]
source = "from-answer"
cidr = "192.168.1.50/24"
gateway = "192.168.1.1"
dns = "192.168.1.1"
filter.INTERFACE = "enp4s0"

[disk-setup]
filesystem = "ext4"
disk-list = ["nvme0n1"]
```

`reboot-mode = "power-off"` is how you know it finished: the mini turns itself off. The internal SSD shows up as `nvme0n1`, an `APPLE SSD AP1024M` in my case.

Boot it by holding Option at power-on and picking **EFI Boot**. GRUB starts the automated install after ten seconds. Press an arrow key first if you need to edit the kernel line.

## One clue worth knowing

After a failed attempt, if the Option boot picker still shows only **Macintosh HD**, the installer never got as far as partitioning the disk. Your macOS install is still intact. The problem is early: the screen, the kernel line, or the answer file.

## Was it worth it

Yes. Proxmox VE 9.2 runs on the mini with the stock kernel. The SSD, the Ethernet and the graphics all use mainline drivers, and nothing T2-specific was needed once it was installed. The hard part is the install, and almost all of that came down to a black screen hiding the real errors. Plug in HDMI first, and most of this post won't happen to you.
