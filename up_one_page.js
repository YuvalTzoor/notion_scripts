const { Client } = require("@notionhq/client");
require("dotenv").config();


// Initialize a new Notion client instance
const notion = new Client({
	auth: process.env.NOTION_API_KEY,
	apiVersion: "2022-06-28",
});

// Set the page ID to update and the properties to update
const pageId = " ";
const updateProperties = {
	title: [{ text: { content: "My awesome title" } }],
};

// Update the page with the new properties
async function updatePage() {
	await notion.pages.update({
		page_id: pageId,
		icon: {
			type: "emoji",
			emoji: "🤓",
		},
	});
	console.log(`Page with ID ${pageId} has been updated.`);
}

// Call the updatePage function to update the page
updatePage().catch(console.error);
