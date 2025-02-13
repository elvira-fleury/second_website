console.log("Starting arXiv query...");

async function fetchPapers() {
    const query = 'all:IVF';
    const url = `https://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending`;
    console.log(`Query URL: ${url}`);

    try {
        const response = await fetch(url);
        const data = await response.text();
        console.log("Query successful. Data received:");
        console.log(data);

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "application/xml");
        const entries = xmlDoc.querySelectorAll('entry');

        let papersHtml = '';
        if (entries.length === 0) {
            papersHtml = '<p>No papers found.</p>';
        } else {
            entries.forEach(entry => {
                const title = entry.querySelector('title').textContent;
                const authors = Array.from(entry.querySelectorAll('author > name')).map(author => author.textContent).join(', ');
                const summary = entry.querySelector('summary').textContent;
                const pdfLink = entry.querySelector('link[title="pdf"]').getAttribute('href');

                papersHtml += `
                    <div class="paper">
                        <h3>${title}</h3>
                        <p><strong>Authors:</strong> ${authors}</p>
                        <p>${summary}</p>
                        <a href="${pdfLink}" target="_blank">Read PDF</a>
                    </div>
                `;
            });
        }

        // Append the papersHtml to the papers-list element
        const papersList = document.getElementById('papers-list');
        if (papersList) {
            papersList.innerHTML = papersHtml;
        } else {
            console.error("Element with id 'papers-list' not found.");
        }

    } catch (error) {
        console.error("Error fetching papers:", error);
    }
}

// Call fetchPapers when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchPapers();
});
