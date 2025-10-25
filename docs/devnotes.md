# hashed passwords

regarding the curious decisions

there is a static salt for all passwords;
* because most copyparty APIs allow users to authenticate using only their password, making the username unknown, so impossible to do per-account salts
* the drawback of this is that an attacker can bruteforce all accounts in parallel, however most copyparty instances only have a handful of accounts in the first place, and it can be compensated by increasing the hashing cost anyways


# http api

* table-column `params` = URL parameters; `?foo=bar&qux=...`
* table-column `body` = POST payload
* method `jPOST` = json post
* method `mPOST` = multipart post
* method `uPOST` = url-encoded post
* `FILE` = conventional HTTP file upload entry (rfc1867 et al, filename in `Content-Disposition`)

authenticate using header `Cookie: cppwd=foo` or url param `&pw=foo`

## read

| method | params | result |
|--|--|--|
| GET | `?dl` | download file (don't show in-browser) |
| GET | `?ls` | list files/folders at URL as JSON |
| GET | `?ls&dots` | list files/folders at URL as JSON, including dotfiles |
| GET | `?ls=t` | list files/folders at URL as plaintext |
| GET | `?ls=v` | list files/folders at URL, terminal-formatted |
| GET | `?opds` | list files/folders at URL as opds feed, for e-readers |
| GET | `?lt` | in listings, use symlink timestamps rather than targets |
| GET | `?b` | list files/folders at URL as simplified HTML |
| GET | `?tree=.` | list one level of subdirectories inside URL |
| GET | `?tree` | list one level of subdirectories for each level until URL |
| GET | `?tar` | download everything below URL as a gnu-tar file |
| GET | `?tar=gz:9` | ...as a gzip-level-9 gnu-tar file |
| GET | `?tar=xz:9` | ...as an xz-level-9 gnu-tar file |
| GET | `?tar=pax` | ...as a pax-tar file |
| GET | `?tar=pax,xz` | ...as an xz-level-1 pax-tar file |
| GET | `?zip` | ...as a zip file |
| GET | `?zip=dos` | ...as a WinXP-compatible zip file |
| GET | `?zip=crc` | ...as an MSDOS-compatible zip file |
| GET | `?tar&w` | pregenerate webp thumbnails |
| GET | `?tar&j` | pregenerate jpg thumbnails |
| GET | `?tar&p` | pregenerate audio waveforms |
| GET | `?shares` | list your shared files/folders |
| GET | `?dls` | show active downloads (do this as admin) |
| GET | `?ups` | show recent uploads from your IP |
| GET | `?ups&filter=f` | ...where URL contains `f` |
| GET | `?ru` | show all recent uploads |
| GET | `?ru&filter=f` | ...where URL contains `f` |
| GET | `?ru&j` | ...as json |
| GET | `?mime=foo` | specify return mimetype `foo` |
| GET | `?v` | render markdown file at URL |
| GET | `?v` | open image/video/audio in mediaplayer |
| GET | `?txt` | get file at URL as plaintext |
| GET | `?txt=iso-8859-1` | ...with specific charset |
| GET | `?tail` | continuously stream a growing file |
| GET | `?tail=1024` | ...starting from byte 1024 |
| GET | `?tail=-128` | ...starting 128 bytes from the end |
| GET | `?th` | get image/video at URL as thumbnail |
| GET | `?th=opus` | convert audio file to 128kbps opus |
| GET | `?th=caf` | ...in the iOS-proprietary container |
| GET | `?zls` | get listing of filepaths in zip file at URL |
| GET | `?zget=path` | get specific file from inside a zip file at URL |

| method | body | result |
|--|--|--|
| jPOST | `{"q":"foo"}` | do a server-wide search; see the `[🔎]` search tab `raw` field for syntax |

| method | params | body | result |
|--|--|--|--|
| jPOST | `?tar` | `["foo","bar"]` | download folders `foo` and `bar` inside URL as a tar file |

## write

| method | params | result |
|--|--|--|
| POST | `?copy=/foo/bar` | copy the file/folder at URL to /foo/bar |
| POST | `?move=/foo/bar` | move/rename the file/folder at URL to /foo/bar |

| method | params | body | result |
|--|--|--|--|
| PUT | | (binary data) | upload into file at URL |
| PUT | `?j` | (binary data) | ...and reply with json |
| PUT | `?ck` | (binary data) | upload without checksum gen (faster) |
| PUT | `?ck=md5` | (binary data) | return md5 instead of sha512 |
| PUT | `?gz` | (binary data) | compress with gzip and write into file at URL |
| PUT | `?xz` | (binary data) | compress with xz and write into file at URL |
| mPOST | | `f=FILE` | upload `FILE` into the folder at URL |
| mPOST | `?j` | `f=FILE` | ...and reply with json |
| mPOST | `?ck` | `f=FILE` | ...and disable checksum gen (faster) |
| mPOST | `?ck=md5` | `f=FILE` | ...and return md5 instead of sha512 |
| mPOST | `?replace` | `f=FILE` | ...and overwrite existing files |
| mPOST | `?media` | `f=FILE` | ...and return medialink (not hotlink) |
| mPOST | | `act=mkdir`, `name=foo` | create directory `foo` at URL |
| POST | `?delete` | | delete URL recursively |
| POST | `?eshare=rm` | | stop sharing a file/folder |
| POST | `?eshare=3` | | set expiration to 3 minutes |
| jPOST | `?share` | (complicated) | create temp URL for file/folder |
| jPOST | `?delete` | `["/foo","/bar"]` | delete `/foo` and `/bar` recursively |
| uPOST | | `msg=foo` | send message `foo` into server log |
| mPOST | | `act=tput`, `body=TEXT` | overwrite markdown document at URL |

upload modifiers:

| http-header | url-param | effect |
|--|--|--|
| `Accept: url` | `want=url` | return just the file URL |
| `Accept: json` | `want=json` | return upload info as json; same as `?j` |
| `Rand: 4` | `rand=4` | generate random filename with 4 characters |
| `Life: 30` | `life=30` | delete file after 30 seconds |
| `Replace: 1` | `replace` | overwrite file if exists |
| `CK: no` | `ck` | disable serverside checksum (maybe faster) |
| `CK: md5` | `ck=md5` | return md5 checksum instead of sha512 |
| `CK: sha1` | `ck=sha1` | return sha1 checksum |
| `CK: sha256` | `ck=sha256` | return sha256 checksum |
| `CK: b2` | `ck=b2` | return blake2b checksum |
| `CK: b2s` | `ck=b2s` | return blake2s checksum |

* `life` only has an effect if the volume has a lifetime, and the volume lifetime must be greater than the file's
* `replace` upload-modifier:
  * the header `replace: 1` works for both PUT and multipart-post
  * the url-param `replace` only works for multipart-post
* server behavior of `msg` can be reconfigured with `--urlform`

## admin

| method | params | result |
|--|--|--|
| GET | `?reload=cfg` | reload config files and rescan volumes |
| GET | `?scan` | initiate a rescan of the volume which provides URL |
| GET | `?scan=/a,/b` | initiate a rescan of volumes `/a` and `/b` |
| GET | `?stack` | show a stacktrace of all threads |

## general

| method | params | result |
|--|--|--|
| GET | `?pw=x` | logout |
| GET | `?grid` | ui: show grid-view |
| GET | `?imgs` | ui: show grid-view with thumbnails |
| GET | `?grid=0` | ui: show list-view |
| GET | `?imgs=0` | ui: show list-view |
| GET | `?thumb` | ui, grid-mode: show thumbnails |
| GET | `?thumb=0` | ui, grid-mode: show icons |


# event hooks

on writing your own [hooks](../README.md#event-hooks)

## hook effects

hooks can cause intentional side-effects,  such as redirecting an upload into another location, or creating+indexing additional files, or deleting existing files, by returning json on stdout

* `reloc` can redirect uploads before/after uploading has finished, based on filename, extension, file contents, uploader ip/name etc.
  * example: [reloc-by-ext](https://github.com/9001/copyparty/blob/hovudstraum/bin/hooks/reloc-by-ext.py)
* `idx` informs copyparty about a new file to index as a consequence of this upload
  * example: [podcast-normalizer.py](https://github.com/9001/copyparty/blob/hovudstraum/bin/hooks/podcast-normalizer.py)
* `del` tells copyparty to delete an unrelated file by vpath
  * example: (　´・ω・) nyoro~n

for these to take effect, the hook must be defined with the `c1` flag; see example [reloc-by-ext](https://github.com/9001/copyparty/blob/hovudstraum/bin/hooks/reloc-by-ext.py)

a subset of effect types are available for a subset of hook types,

* most hook types (xbu/xau/xbr/xar/xbd/xad/xm) support `idx` and `del` for all http protocols (up2k / basic-uploader / webdav), but not ftp/tftp/smb
* most hook types will abort/reject the action if the hook returns nonzero, assuming flag `c` is given, see examples [reject-extension](https://github.com/9001/copyparty/blob/hovudstraum/bin/hooks/reject-extension.py) and [reject-mimetype](https://github.com/9001/copyparty/blob/hovudstraum/bin/hooks/reject-mimetype.py)
* `xbu` supports `reloc` for all http protocols (up2k / basic-uploader / webdav), but not ftp/tftp/smb
* `xau` supports `reloc` for basic-uploader / webdav only, not up2k or ftp/tftp/smb
  * so clients like sharex are supported, but not dragdrop into browser

to trigger indexing of files `/foo/1.txt` and `/foo/bar/2.txt`, a hook can `print(json.dumps({"idx":{"vp":["/foo/1.txt","/foo/bar/2.txt"]}}))` (and replace "idx" with "del" to delete instead)
* note: paths starting with `/` are absolute URLs, but you can also do `../3.txt` relative to the destination folder of each uploaded file

## hook import

the `I` flag runs the hook inside copyparty,  which can be very useful and dangerous:

* around 140x faster because it doesn't need to launch a new subprocess
* the hook can intentionally (or accidentally) mess with copyparty's internals
  * very easy to crash things if not careful


# assumptions

## mdns

* outgoing replies will always fit in one packet
* if a client mentions any of our services, assume it's not missing any
* always answer with all services, even if the client only asked for a few
* not-impl: probe tiebreaking (too complicated)
* not-impl: unicast listen (assume avahi took it)


# sfx repack

reduce the size of an sfx by removing features

if you don't need all the features, you can repack the sfx and save a bunch of space; all you need is an sfx and a copy of this repo (nothing else to download or build, except if you're on windows then you need msys2 or WSL)
* `393k` size of original sfx.py as of v1.1.3
* `310k` after `./scripts/make-sfx.sh re no-cm`
* `269k` after `./scripts/make-sfx.sh re no-cm no-hl`

the features you can opt to drop are
* `cm`/easymde, the "fancy" markdown editor, saves ~89k
* `hl`, prism, the syntax highlighter, saves ~41k
* `fnt`, source-code-pro, the monospace font, saves ~9k

for the `re`pack to work, first run one of the sfx'es once to unpack it

**note:** you can also just download and run [/scripts/copyparty-repack.sh](https://github.com/9001/copyparty/blob/hovudstraum/scripts/copyparty-repack.sh) -- this will grab the latest copyparty release from github and do a few repacks; works on linux/macos (and windows with msys2 or WSL)


# building

## dev env setup

you need python 3.9 or newer due to type hints

setting up a venv with the below packages is only necessary if you want it for vscode or similar

```sh
python3 -m venv .venv
. .venv/bin/activate
pip install jinja2 strip_hints  # MANDATORY
pip install argon2-cffi  # password hashing
pip install pyzmq  # send 0mq from hooks
pip install mutagen  # audio metadata
pip install pyftpdlib  # ftp server
pip install partftpy  # tftp server
pip install impacket  # smb server -- disable Windows Defender if you REALLY need this on windows
pip install Pillow pillow-heif  # thumbnails
pip install pyvips  # faster thumbnails
pip install psutil  # better cleanup of stuck metadata parsers on windows
pip install black==21.12b0 click==8.0.2 bandit pylint flake8 isort mypy  # vscode tooling
```

* on archlinux you can do this:
  * `sudo pacman -Sy --needed python-{pip,isort,jinja,argon2-cffi,pyzmq,mutagen,pyftpdlib,pillow}`
  * then, as user: `python3 -m pip install --user --break-system-packages -U strip_hints black==21.12b0 click==8.0.2`
  * for building docker images: `sudo pacman -Sy --needed qemu-user-static{,-binfmt} podman{,-docker} jq`

* and if you want to run the python 2.7 tests:
  * `git clone https://github.com/pyenv/pyenv .pyenv ; cd .pyenv/bin ; env PYTHON_CONFIGURE_OPTS='--enable-optimizations' PYTHON_CFLAGS='-march=native -mtune=native -std=c17' ./pyenv install 2.7.18 -v ; ln -s $HOME/.pyenv/versions/2.7.18/bin/python2 $HOME/bin/`


## just the sfx

if you just want to modify the copyparty source code (py/html/css/js) then this is the easiest approach

build the sfx using any of the following examples:

```sh
./scripts/make-sfx.sh           # regular edition
./scripts/make-sfx.sh fast      # build faster (worse js/css compression)
./scripts/make-sfx.sh gz no-cm  # gzip-compressed + no fancy markdown editor
```


## build from release tarball

uses the included prebuilt webdeps

if you downloaded a [release](https://github.com/9001/copyparty/releases) source tarball from github (for example [copyparty-1.6.15.tar.gz](https://github.com/9001/copyparty/releases/download/v1.6.15/copyparty-1.6.15.tar.gz) so not the autogenerated one) you can build it like so,

```bash
python3 -m pip install --user -U build setuptools wheel jinja2 strip_hints
bash scripts/run-tests.sh python3  # optional
python3 -m build
```

if you are unable to use `build`, you can use the old setuptools approach instead,

```bash
python3 setup.py install --user setuptools wheel jinja2
python3 setup.py build
python3 setup.py bdist_wheel
# you now have a wheel which you can install. or extract and repackage:
python3 setup.py install --skip-build --prefix=/usr --root=$HOME/pe/copyparty
```


## build from scratch

how the sausage is made:

to get started, first `cd` into the `scripts` folder

* the first step is the webdeps; they end up in `../copyparty/web/deps/` for example `../copyparty/web/deps/marked.js.gz` -- if you need to build the webdeps, run `make -C deps-docker`
  * this needs rootless podman and the `podman-docker` compat-layer to pretend it's docker, although it *should* be possible to use rootful/rootless docker too
  * if you don't have rootless podman/docker then `sudo make -C deps-docker` is fine too
  * alternatively, you can entirely skip building the webdeps and instead extract the compiled webdeps from the latest github release with `./make-sfx.sh fast dl-wd`

* next, build `copyparty-sfx.py` by running `./make-sfx.sh gz fast`
  * this is a dependency for most of the remaining steps, since they take the sfx as input
  * removing `fast` makes it compress better
  * removing `gz` too compresses even better, but startup gets slower

* if you want to build the `.pyz` standalone "binary", now run `./make-pyz.sh`

* if you want to build the `tar.gz` for use in a linux-distro package, now run `./make-tgz-release.sh theVersionNumber`

* if you want to build a pypi package, now run `./make-pypi-release.sh d`

* if you want to build a docker-image, you have two options:
  * if you want to use podman to build all docker-images for all supported architectures, now run `(cd docker; ./make.sh hclean; ./make.sh hclean pull img)`
  * if you want to use docker to build all docker-images for your native architecture, now run `sudo make -C docker`
  * if you want to do something else, please take a look at `docker/make.sh` or `docker/Makefile` for inspiration

* if you want to build the windows exe, first grab some snacks and a beer, [you'll need it](https://github.com/9001/copyparty/tree/hovudstraum/scripts/pyinstaller)

the complete list of buildtime dependencies to do a build from scratch is as follows:

* on ubuntu-server, install podman or [docker](https://get.docker.com/), and then `sudo apt install make zip bzip2`
  * because ubuntu is specifically what someone asked about :-p


## complete release

also builds the sfx so skip the sfx section above

*WARNING: `rls.sh` has not yet been updated with the docker-images and arch/nix packaging*

does everything completely from scratch, straight from your local repo

in the `scripts` folder:

* run `make -C deps-docker` to build all dependencies
* run `./rls.sh 1.2.3` which uploads to pypi + creates github release + sfx


# debugging

## music playback halting on phones

mostly fine on android,  but still haven't find a way to massage iphones into behaving well

* conditionally starting/stopping mp.fau according to mp.au.readyState <3 or <4 doesn't help
* loop=true doesn't work, and manually looping mp.fau from an onended also doesn't work (it does nothing)
* assigning fau.currentTime in a timer doesn't work, as safari merely pretends to assign it
* on ios 16.7.7, mp.fau can sometimes make everything visibly work correctly, but no audio is actually hitting the speakers

can be reproduced with `--no-sendfile --s-wr-sz 8192 --s-wr-slp 0.3 --rsp-slp 6` and then play a collection of small audio files with the screen off, `ffmpeg -i track01.cdda.flac -c:a libopus -b:a 128k -segment_time 12 -f segment smol-%02d.opus`


## discarded ideas

* optimization attempts which didn't improve performance
  * remove brokers / multiprocessing stuff; https://github.com/9001/copyparty/tree/no-broker
  * reduce the nesting / indirections in `HttpCli` / `httpcli.py`
    * nearly zero benefit from stuff like replacing all the `self.conn.hsrv` with a local `hsrv` variable
* single sha512 across all up2k chunks?
  * crypto.subtle cannot into streaming, would have to use hashwasm, expensive
* separate sqlite table per tag
  * performance fixed by skipping some indexes (`+mt.k`)
* audio fingerprinting
  * only makes sense if there can be a wasm client and that doesn't exist yet (except for olaf which is agpl hence counts as not existing)
* `os.copy_file_range` for up2k cloning
  * almost never hit this path anyways
* up2k partials ui
  * feels like there isn't much point
* cache sha512 chunks on client
  * too dangerous -- overtaken by turbo mode
* comment field
  * nah
* look into android thumbnail cache file format
  * absolutely not
* indexedDB for hashes, cfg enable/clear/sz, 2gb avail, ~9k for 1g, ~4k for 100m, 500k items before autoeviction
  * blank hashlist when up-ok to skip handshake
    * too many confusing side-effects
* hls framework for Someone Else to drop code into :^)
  * probably not, too much stuff to consider -- seeking, start at offset, task stitching (probably np-hard), conditional passthru, rate-control (especially multi-consumer), session keepalive, cache mgmt...
