# THE WHOLE SEK

E-book consisting of the more-or-less complete works of Scott Eric Kaufman.

## Dependencies

On Ubuntu:

```
sudo apt-get -y install make pandoc
```

[atom](http://atom.io) with the Markdown plugin is highly recommended for editing.

## Getting setup on Windows

Here's the software which should be installed to work with this:

 * [TortoiseGit](http://download.tortoisegit.org/tgit/1.8.12.0/TortoiseGit-1.8.12.0-64bit.msi) - Version control software
 * [atom.io](https://atom.io/download/windows) - Multiple document editor with Markdown highlighting support (important: to make sure that atom doesn't eat the ending spaces, the "whitespace" plugin should be configured *not* to strip ending whitespaces)
 * [Pandoc for Windows](https://github.com/jgm/pandoc/releases/download/1.13.2/pandoc-1.13.2-windows.msi) and [MiKTeX](http://mirrors.ctan.org/systems/win32/miktex/setup/basic-miktex-2.9.5105.exe) if you want to build the actual document yourself. Probably should install [GNU make](http://gnuwin32.sourceforge.net/downlinks/make.php) to use the actual Makefile.

## Building

Uses pandoc to build.

```make```

