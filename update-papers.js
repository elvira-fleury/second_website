const fs = require('fs');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

console.log("Starting arXiv query...");

async function fetchPapers() {
    const query = 'all:perfluoroalkyl+substances';
    const url = `http://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending`;
    console.log(`Query URL: ${url}`);

    try {
        const response = await fetch(url);
        const data = await response.text();
        console.log("Query successful. Data received:");
        console.log(data);

        const dom = new JSDOM(data, { contentType: 'application/xml' });
        const entries = dom.window.document.querySelectorAll('entry');

        let papersHtml = '';
        if (entries.length === 0) {
            papersHtml = '<p>No papers found.</p>';
        } else {
            entries.forEach(entry => {
                const title = entry.querySelector('title').textContent;
                const summary = entry.querySelector('summary').textContent;
                const link = entry.querySelector('link').getAttribute('href');

                papersHtml += `
                    <div class="paper">
                        <h3>${title}</h3>
                        <p>${summary}</p>
                        <a href="${link}" target="_blank">Read more</a>
                    </div>
                `;
            });
        }

        console.log("Generated HTML for papers:");
        console.log(papersHtml);

        const htmlFilePath = './papers.html';
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
        console.log("Original HTML content:");
        console.log(htmlContent);

        htmlContent = htmlContent.replace(/<div id="papers-list">.*<\/div>/s, `<div id="papers-list">${papersHtml}</div>`);
        console.log("Updated HTML content:");
        console.log(htmlContent);

        fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
        console.log(`Updated ${htmlFilePath} with new papers.`);
    } catch (error) {
        console.error("Error querying arXiv:", error);
    }
}

fetchPapers();
