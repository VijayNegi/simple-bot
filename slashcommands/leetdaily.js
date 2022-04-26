// Just some constants
const LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql'
const DAILY_CODING_CHALLENGE_QUERY = `
query questionOfToday {
	activeDailyCodingChallengeQuestion {
		date
		userStatus
		link
		question {
			acRate
			difficulty
			freqBar
			frontendQuestionId: questionFrontendId
			isFavor
			paidOnly: isPaidOnly
			status
			title
			titleSlug
			hasVideoSolution
			hasSolution
			topicTags {
				name
				id
				slug
			}
		}
	}
}`

// We can pass the JSON response as an object to our createTodoistTask later.
const fetchDailyCodingChallenge = async () => {
    console.log(`Fetching daily coding challenge from LeetCode API.`)

    const init = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: DAILY_CODING_CHALLENGE_QUERY }),
    }

    const response = await fetch(LEETCODE_API_ENDPOINT, init)
    return response.json()
}

const run = async (client, interaction) => {
	let date = interaction.options.getUser("date") || "today"

	if (!date) return interaction.reply("You must provide a date of question")

	// post question
	try {
		interaction.reply(` Posting Question for today`)
		
		const response  = await fetchDailyCodingChallenge()
		//let res = JSON.parse(response)
		let question  = response.data.activeDailyCodingChallengeQuestion
		let qdate = question.date
		let link = "https://leetcode.com"+ question.link
		const thread = await interaction.channel.threads.create({
			name: qdate,
			autoArchiveDuration: 1440,
			reason: 'Todays Leetcode daily Challenge',
		});

		thread.send("LeetcodeDaily : " + qdate + "\n\n"+ link)
		console.log(`Created thread: ${thread.name}`);
		return interaction.deleteReply().catch(console.error);
        //console.log(response)
        // create a thread and post
		//return interaction.reply(`Question for ${date} has been posted`).deleteReply()
	} catch (e) {
		if (e) {
			console.error(e)
			return interaction.reply(`Failed to post question for ${date}`)
		}
	}
}

module.exports = {
	name: "leetdaily",
	description: "Post Daily Leetcode question",
	options: [
		{ name: "date", description: "Date of daily question", type: "STRING", required: false }
	],
	run,
}