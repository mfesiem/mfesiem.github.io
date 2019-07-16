mkdir temp && cd temp
git clone https://github.com/mfesiem/msiempy && cd msiempy
git checkout docsstrings
pdoc msiempy --output-dir ../../docs --html
pyreverse -s 1 -f PUB_ONLY -o png -m y msiempy
mv ./classes.png ../../docs/msiempy
mv ./packages.png ../../docs/msiempy
cd ../.. && rm -rf temp
git add .
git commit -m 'Generate docs'
git push origin master
git status