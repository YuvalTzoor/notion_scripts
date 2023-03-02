const { Client } = require("@notionhq/client");
require("dotenv").config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Initialize a new Notion client instance

// Set up the database ID and filter conditions
const databaseId = process.env.NOTION_DATABASE_ID;
const filterCondition = {
	property: "title",
	title: {
		contains: "Competitive Intelligence",
	},
};

// Set up the properties to update for the events
const updateProperties = {
	type: "emoji",
	// Use one or another, not both:
	emoji: "💼",

	// Use one or another, not both:
};

// Retrieve future events within the next 3 months from the database that match the filter conditions
async function getFutureEvents(cursor) {
	const now = new Date();
	const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, 1);
	const filterConditionFuture = {
		property: "Date",
		date: {
			on_or_after: now.toISOString(),
			before: threeMonthsFromNow.toISOString(),
		},
	};
	const response = await notion.databases.query({
		database_id: databaseId,
		filter: {
			and: [filterCondition, filterConditionFuture],
		},
		start_cursor: cursor,
		page_size: 10,
	});

	// Update the events with the nerd face icon
	const updates = response.results.map((result) => {
		return {
			id: result.id,
			properties: updateProperties,
		};
	});

	for (const update of updates) {
		async () => {
			const pageId = update.id;
			const response = await notion.pages.retrieve({ page_id: pageId });
			console.log(response);
		};
		await notion.pages.update({
			page_id: update.id,
			icon: {
				type: "emoji",
				emoji: "🤓",
			},
		});
	}

	// Check if there are more pages to retrieve
	if (response.has_more) {
		const nextCursor = response.next_cursor;
		const nextResults = await getFutureEvents(nextCursor);
		return response.results.concat(nextResults);
	} else {
		return response.results;
	}
}

// Call the function to retrieve future events and log the results
getFutureEvents().then((events) => console.log(events));
