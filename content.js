const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY";
const MODEL = "gpt-4o-mini"; // Use gpt-4o for better summarization. But it is more expensive.

// Thresholds for summarization based on text length
// the first number is the number of characters in the text
// and the second number is number of words to summarize to.
// Thus, this means that any text from 200 to 500 characters
// is summarized to 20 words, any text from 500 to 1000 characters
// is summarized to 50 words, etc.
//
// You can change this to suit your needs.
const THRESHOLD_CHARS = [
    [200, 20],
    [500, 50],
    [1000, 100]
];

// Given a text, figure out the num_words to summarize
function getNumSummaryWords(text) {
    for (let [threshold_chars, num_words] of THRESHOLD_CHARS) {
        if (text.length > threshold_chars) {
            return num_words;
        }
    }
    return 0;
}

// Function to summarize text (placeholder)
async function summarizeText(text) {
    const url = 'https://api.openai.com/v1/chat/completions';

    let num_words = getNumSummaryWords(text);
    if (num_words === 0) {
        return "Read the whole damn thing!"
    }

    const prompt = `Summarize the following text in approximately ${num_words} words. Your response should contain just the summary and nothing else: "${text}"`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: prompt }],
        max_tokens: 200, 
        }),
    });

    const data = await response.json();

    if (response.ok) {
        return data.choices[0].message.content.trim();
    } else {
        throw new Error(`Error: ${data.error.message}`);
    }
}
  
async function selectParagraphs() {
    var paragraphs = document.querySelectorAll('p');
    return paragraphs;
}

async function processParagraphs() {
    // Select all paragraph elements on the page
    var paragraphs = await selectParagraphs();

    // Create placeholder divs for all paragraphs first
    let summaryDivs = [];
    for (let p of paragraphs) {
        let text = p.textContent;
        let num_words = getNumSummaryWords(text);

        // Add a box around the paragraph
        if (num_words > 0) {
            p.style.border = '2px solid blue';
        } else {
            p.style.border = '1px dotted grey';
        }
        p.style.padding = '10px';
        p.style.margin = '10px 0';

        if (num_words > 0) {
            // Create a placeholder div for the summary
            let summaryDiv = document.createElement('div');
            summaryDiv.style.border = '2px solid grey';
            summaryDiv.style.padding = '10px';
            summaryDiv.style.margin = '10px 0';
            summaryDiv.style.backgroundColor = '#f9f9f9';
            summaryDiv.style.fontStyle = 'italic';
            summaryDiv.style.color = 'grey';

            // Set the placeholder text
            summaryDiv.textContent = 'Summarizing...';

            // Insert the placeholder div before the paragraph
            p.parentNode.insertBefore(summaryDiv, p);
            
            // Store reference to update later
            summaryDivs.push({ summaryDiv, text });
        }
    }

    // Now fetch the summaries and update the divs
    for (let { summaryDiv, text } of summaryDivs) {
        let summary = await summarizeText(text);
        summaryDiv.textContent = summary;
        summaryDiv.style.fontStyle = 'normal'; // Remove italic after summary is loaded
        summaryDiv.style.color = 'black';      // Change text color back to normal
        summaryDiv.style.border = '2px solid green'; // Change border color to green
    }
}


async function processParagraphs_old() {
    // Select all paragraph elements on the page
    var paragraphs = await selectParagraphs();

    // Process each paragraph
    for (let p of paragraphs) {
        let text = p.textContent;

        // Add a box around the paragraph
        p.style.border = '2px solid blue';
        p.style.padding = '10px';
        p.style.margin = '10px 0';

        if (text.length > 1000) {
            // Summarize the text
            let summary = await summarizeText(text);

            // Create a new div element to hold the summary
            let summaryDiv = document.createElement('div');
            summaryDiv.style.border = '2px solid green';
            summaryDiv.style.padding = '10px';
            summaryDiv.style.margin = '10px 0';
            summaryDiv.style.backgroundColor = '#f9f9f9';

            // Set the summary text
            summaryDiv.textContent = summary;

            // Insert the summary div before the paragraph
            p.parentNode.insertBefore(summaryDiv, p);
        }
    }
}
  
// Execute the function
processParagraphs().then(() => {
    console.log('All paragraphs processed');
}).catch((error) => {
    console.error('Error processing paragraphs:', error);
});

