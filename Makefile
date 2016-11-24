TITLE := TheWholeSEK

all: clean epub pdf

CONTENT := \
		content/000-meta.yaml \
		content/0*.md \
		content/the-valve/*.md \
		content/edge-of-the-american-west/*.md \
		content/lawyers-guns-and-money/*.md \
		content/the-valve/*.md \
		content/salon/*.md \
		content/acephalous/*.md \
		content/miscellaneous/*.md

clean:
	rm -f $(TITLE).*

epub:
	pandoc -f markdown -t epub3  \
		--toc \
		--epub-stylesheet content/epub.css \
		-o $(TITLE).epub \
		$(CONTENT)

pdf:
	pandoc -f markdown \
		-V geometry:margin=1.2in \
		--chapters \
		--variable mainfont=Georgia \
		--template content/template.tex \
		--toc \
		-o $(TITLE).pdf \
		$(CONTENT)

tex:
	pandoc -f markdown \
		--chapters \
		--template content/template.tex \
		--toc \
		-o $(TITLE).tex \
		$(CONTENT)

upload:
	@echo " --> Uploading EPUB"
	./scripts/drive-linux-amd64 -c .gdrive upload -p 0BwbNGSC-B22KfnB4X1JscGFlUV8wa0d4eUJhT2NyQ1NjeDFTSXNYR0ZiRlgtaUY4eUdNcHc -f $(TITLE).epub
	@echo " --> Uploading PDF"
	./scripts/drive-linux-amd64 -c .gdrive upload -p 0BwbNGSC-B22KfnB4X1JscGFlUV8wa0d4eUJhT2NyQ1NjeDFTSXNYR0ZiRlgtaUY4eUdNcHc -f $(TITLE).pdf

