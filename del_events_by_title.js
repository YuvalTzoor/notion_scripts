const { Client } = require("@notionhq/client");
require("dotenv").config();

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// The ID of your Notion database
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// The title of the event you want to delete
const TITLE_TO_DELETE = "Time to learn!";
const filterCondition = {
	property: "title",
	title: {
		contains: "Time to learn!",
	},
};

// Function to retrieve all events from the Notion database within the next three months
// async function getDatabaseItems() {
// 	const today = new Date();
// 	const threeMonthsFromNow = new Date();
// 	threeMonthsFromNow.setMonth(today.getMonth() + 3);

// 	const response = await notion.databases.query({
// 		database_id: DATABASE_ID,
// 		filter: {
// 			and: [
// 				{
// 					property: "Date", // Replace "Date" with the name of your date property in Notion
// 					date: {
// 						on_or_after: today.toISOString().split("T")[0],
// 					},
// 				},
// 				{
// 					property: "Date", // Replace "Date" with the name of your date property in Notion
// 					date: {
// 						on_or_before: threeMonthsFromNow.toISOString().split("T")[0],
// 					},
// 				},
// 			],
// 		},
// 	});
// 	return response.results;
// }
async function getDatabaseItems(cursor) {
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
		database_id: DATABASE_ID,
		filter: {
			and: [filterCondition, filterConditionFuture],
		},
		start_cursor: cursor,
		page_size: 10,
	});
	// console.log(
	// 	JSON.stringify(response.results.forEach((result) => result.properties))
	// );
	// Update the events with the nerd face icon

	// Check if there are more pages to retrieve
	if (response.has_more) {
		const nextCursor = response.next_cursor;
		const nextResults = await getDatabaseItems(nextCursor);
		return response.results.concat(nextResults);
	} else {
		return response.results;
	}
}
// Function to delete an event from the Notion database
async function deletePage(pageId) {
	await notion.pages.update({
		page_id: pageId,
		archived: true,
	});
}

// Main function to retrieve and delete events based on title
async function deleteEventsByTitle() {
	console.log("in function...");
	try {
		const events = await getDatabaseItems();
		console.log(`Retrieved ${events.length} events from the database.`);

		for (const event of events) {
			const eventTitle = event.properties.Name.title[0]?.plain_text;
			console.log(`Event title: ${eventTitle}`);
			const eventId = event.id;
			console.log(`Event ID: ${eventId}`);

			if (eventTitle === TITLE_TO_DELETE) {
				console.log("Deleting event...");
				await deletePage(eventId);
				console.log(`Deleted event with title: ${TITLE_TO_DELETE}`);
			}
		}
	} catch (error) {
		console.error("An error occurred:", error);
	}
}

// Run the main function
deleteEventsByTitle();
