# swf-export

This repo defines a process for extracting images from a SWF video file and constructing a filmstrip that can be consumed by a JavaScript player.

## Prerequisites

- [Node.js](https://nodejs.org)
- [JPEXS Free Flash Decompiler](https://github.com/jindrapetrik/jpexs-decompiler/releases/latest)

## Instructions

Download and install JPEXS (only FFDec option is required during installation). These instructions assume you've:

- Installed FFDec to the default location
- Placed your SWF files to convert into a folder named "swf"

```shell
# export individual images to "img" folder
"%PROGRAMFILES(X86)%\FFDec\ffdec.bat" -format image:jpg -export image img swf

# install dependencies
npm i

# rename images to pad with zeroes to ensure proper sequence
npm run pad-files

# create optimized filmstrips in "final" folder
npm run make-filmstrips
```

## Configuration

You can customize the filmstrip sprite-creation behavior by adjusting three variables at the top of gulpfile.js:

```js
const COMPRESSION = 50; // JPG compression percentage
const OPTIMIZATION = 6; // Image optimization level (1-7)
const USE_COLUMNS = true; // Arrange images into 20 columns
```

## Demo

Place your final image at web/filmstrip.jpg and open web/index.html in a browser.
