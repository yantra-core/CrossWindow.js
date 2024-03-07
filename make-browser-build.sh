# Builds the browser bundle for crosswindow
browserify ./browser-shim.js --standalone CW -o ./dist/crosswindow.js -t babelify
browserify ./browser-shim-debugger.js --standalone CWDEBUG -o ./dist/crosswindow.debugger.js -t babelify

# Copy the crosswindow.js file to ./examples/browser
cp ./dist/crosswindow.js ./examples/crosswindow.js

cp ./dist/crosswindow.debugger.js ./examples/crosswindow.debugger.js

# Copy the crosswindow.js file to ../yantra.gg/public/js
cp ./dist/crosswindow.js ../yantra.gg/public/crosswindow.js
# copy the debugger
cp ./dist/crosswindow.debugger.js ../yantra.gg/public/crosswindow.debugger.js

# Copy the crosswindow.min.js file to ../yantra.gg/public/js
cp ./dist/crosswindow.min.js ../yantra.gg/public/crosswindow.min.js


# Copy the ./examples/browser folder to ../yantra.gg/public/crosswindow
cp -r ./examples/ ../yantra.gg/public/crosswindow

# Minifies the generated bundle and creates a source map
uglifyjs ./dist/crosswindow.js --compress --mangle --source-map "url='crosswindow.min.js.map',root='../',includeSources" -o ./dist/crosswindow.min.js
uglifyjs ./dist/crosswindow.debugger.js --compress --mangle --source-map "url='crosswindow.debugger.min.js.map',root='../',includeSources" -o ./dist/crosswindow.debugger.min.js

