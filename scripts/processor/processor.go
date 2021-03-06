package main

// Simple blog processor, using html2md and goquery, to convert blog entries
// into Markdown.
//
// @jbuchbinder

import (
	"bytes"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/lunny/html2md"
	"golang.org/x/net/html"
)

var (
	in             = flag.String("in", "input.html", "Input HTML file")
	outDir         = flag.String("out-dir", ".", "Output directory")
	titleElement   = flag.String("title", "meta[property='og:title']", "Title HTML selector")
	titleProperty  = flag.String("title-property", "content", "Title HTML selector attribute")
	urlElement     = flag.String("url", "meta[property='og:url']", "URL HTML selector")
	urlProperty    = flag.String("url-property", "content", "URL HTML selector attribute")
	dateElement    = flag.String("date", "h2[class='date-header']", "Date HTML selector")
	dateProperty   = flag.String("date-property", "", "Date HTML selector attribute")
	dateFormat     = flag.String("date-format", "Monday, 02 January 2006", "Date format (Mon Jan 2 15:04:05 MST 2006)")
	contentElement = flag.String("content", "div.entry-content", "Content HTML selector")
	purgeElements  = flag.String("purge-elements", "", "Comma-separated element list to purge from content")
)

func main() {
	flag.Parse()

	if !fileExists(*in) {
		panic("Unable to open " + *in)
	}

	fp, err := os.Open(*in)
	if err != nil {
		panic(err)
	}
	defer fp.Close()
	doc, err := goquery.NewDocumentFromReader(fp)
	if err != nil {
		panic(err)
	}

	var title, url, contentBody string
	var date time.Time

	doc.Find(*urlElement).Each(func(i int, s *goquery.Selection) {
		if *urlProperty == "" {
			url, _ = s.Html()
			return
		}
		url, _ = s.Attr(*urlProperty)
	})
	doc.Find(*titleElement).Each(func(i int, s *goquery.Selection) {
		if *titleProperty == "" {
			title, _ = s.Html()
			return
		}
		title, _ = s.Attr(*titleProperty)
	})
	doc.Find(*dateElement).Each(func(i int, s *goquery.Selection) {
		var dateText string
		if *dateProperty == "" {
			dateText, _ = s.Html()
		} else {
			dateText, _ = s.Attr(*dateProperty)
		}
		date, _ = time.Parse(*dateFormat, dateText)
	})
	doc.Find(*contentElement).Each(func(i int, s *goquery.Selection) {
		s.Find(*purgeElements).Each(func(i int, s2 *goquery.Selection) {
			removeNode(s.Get(0), s2.Get(0))
		})
		contentBodySegment, _ := s.Html()
		if contentBody != "" {
			contentBody += "\n<hr/>\n"
		}
		contentBody += contentBodySegment
	})

	var buf bytes.Buffer

	buf.WriteString(fmt.Sprintf("## %s\n\n", title))
	buf.WriteString(fmt.Sprintf(" * Originally posted at %s\n", url))
	buf.WriteString(fmt.Sprintf(" * %s\n\n", date.Format("Monday, January 02, 2006")))

	md := html2md.Convert(sanitizeHtmlInput(contentBody))

	buf.WriteString(sanitizeMarkdownOutput(fmt.Sprintf(md)))

	if *outDir == "" {
		fmt.Printf(buf.String())
		return
	}

	// Form slug
	slug := date.Format("2006-01-02") + "-" + sanitizeSlugName(title)
	//fmt.Println(slug + ".md")

	fn := *outDir + string(os.PathSeparator) + slug + ".md"
	fmt.Println("Writing to " + fn)
	ioutil.WriteFile(fn, buf.Bytes(), 0600)
}

// removeNode searches node siblings (and child siblings and so on)
// and after successfully found - remove it
func removeNode(rootNode *html.Node, removeMe *html.Node) {
	foundNode := false
	checkNodes := make(map[int]*html.Node)
	i := 0

	// loop through siblings
	for n := rootNode.FirstChild; n != nil; n = n.NextSibling {
		if n == removeMe {
			foundNode = true
			n.Parent.RemoveChild(n)
		}

		checkNodes[i] = n
		i++
	}

	// check if removing node is found
	// if yes no need to check childs returning
	// if no continue loop through childs and so on
	if foundNode == false {
		for _, item := range checkNodes {
			removeNode(item, removeMe)
		}
	}
}

func sanitizeHtmlInput(i string) string {
	repl := map[string]string{
		"&amp;": "&",
		"*":     "\\*",
		"_":     "\\_",
	}
	x := i
	for k, v := range repl {
		x = strings.Replace(x, k, v, -1)
	}
	return x
}

func sanitizeMarkdownOutput(i string) string {
	repl := map[string]string{
		"&#34;":    "\"",
		"&#39;":    "'",
		"\n\n\n\n": "\n\n",
		"\n\n\n":   "\n\n",
	}
	x := i
	for k, v := range repl {
		x = strings.Replace(x, k, v, -1)
	}
	return x
}

func sanitizeSlugName(name string) string {
	trimout := []string{
		" ", "!", "&amp;", "&", "_", "%", "#", "@", ";", ":",
		",", "’", "'", "(", ")", "'", `"`, "[", "]", "*", ".",
		"”", "“", "?", "…", "—", "<em>", "</em>", "–",
		"\r", "\n", "\t",
	}
	x := strings.Trim(strings.ToLower(name), " .-!")
	// Sanitize all unwanted characters
	for _, t := range trimout {
		x = strings.Replace(x, t, "-", -1)
	}
	// Remove duplicates
	x = strings.Replace(x, "--", "-", -1)
	// Get rid of dashes at the end
	x = strings.Trim(x, "-")
	return x
}

func fileExists(name string) bool {
	if _, err := os.Stat(name); err != nil {
		if os.IsNotExist(err) {
			return false
		}
	}
	return true
}
