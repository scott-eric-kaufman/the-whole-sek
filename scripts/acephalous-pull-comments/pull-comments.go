package main

// Pull comment blocks from acephalous into Markdown.
//
// @jbuchbinder

import (
	"bytes"
	"flag"
	"fmt"
	"os"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/lunny/html2md"
)

var (
	in = flag.String("in", "input.html", "Input HTML file")
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

	/*

		        <div class="comment-content font-entrybody" id="comment-11719023-content">
		                <span id="comment-11719023-content"><p><i>My favorite moment:</i></p>

		<p><i>&quot;HALF-NAKED MALE: THIS IS SEXUAL HARASSMENT!&quot;</i></p>

		<p><i>No, this is harrassing people who are trying to have sex. Very different.</i></p>

		<p>Not to pick nits, but frankly the cranial energy it took to decide to have sex in someone&#39;s office isn&#39;t exactly a high voltage situation.  Couple that (pun intended) with a blood flow moving away from the brain into the nether regions..and Kaufman is probably lucky to get THAT much.</p>

		<p>This made my day, btw. LOL<br />
		</p></span>
		        </div>
		        <p class="comment-footer font-entryfooter">
		                Posted by:
		                <a rel="nofollow" target="_blank" title="http://preemptivekarma.com" href="http://preemptivekarma.com">carla</a> |
		                <a rel="nofollow" href="http://acephalous.typepad.com/acephalous/2005/11/my_morning.html?cid=11719023#comment-6a00d8341c2df453ef00d8346302e253ef">Thursday, 01 December 2005 at 01:09 PM</a>
		        </p>
		</div>

	*/

	comments := make([]string, 0)
	comments = append(comments, "")

	doc.Find("DIV.comment").Each(func(i int, s *goquery.Selection) {
		var buf bytes.Buffer
		s.Find("DIV.comment-content").Each(func(i int, s2 *goquery.Selection) {
			content, _ := s2.Html()
			md := html2md.Convert(sanitizeHtmlInput(content))
			buf.WriteString(sanitizeMarkdownOutput(fmt.Sprintf(md)))
			buf.WriteString("\n")
		})
		s.Find("P.comment-footer").Each(func(i int, s2 *goquery.Selection) {
			content, _ := s2.Html()
			md := html2md.Convert(sanitizeHtmlInput(content))
			buf.WriteString(sanitizeSpaces(sanitizeMarkdownOutput(fmt.Sprintf(md))))
		})
		comments = append(comments, buf.String())
	})

	fmt.Println(strings.Join(comments, "\n\n* * *\n\n"))
}

func sanitizeSpaces(i string) string {
	repl := map[string]string{
		"\n": " ",
		"\t": " ",
		"  ": " ",
	}
	x := i
	for k, v := range repl {
		x = strings.Replace(x, k, v, -1)
	}
	return x
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
