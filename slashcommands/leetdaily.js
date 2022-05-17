const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { getQuestionData } = require('./../database/mongodb.js')
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
			likes
			dislikes
			questionFrontendId
			isFavor
			paidOnly: isPaidOnly
			status
			title
			titleSlug
			stats
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
	// post question
	try {
		interaction.reply(` Posting Question for today`)
		
		const response  = await fetchDailyCodingChallenge()

		let daily  = response.data.activeDailyCodingChallengeQuestion
		let question = daily.question
		let qdate = daily.date
		let link = "https://leetcode.com"+ daily.link
		let stats = JSON.parse(question.stats)
		const thread = await interaction.channel.threads.create({
			name: qdate,
			autoArchiveDuration: 1440,
			reason: 'Todays Leetcode daily Challenge',
		});

		
	
		let message = "LeetcodeDaily : " + qdate + "\n\n"
		message += question.questionFrontendId + ".  " + question.title + "\n"
		message += "🧗 " + question.difficulty + " \t\t🎖️  "+ stats.acRate + "\n"
		message += "👍 "+ question.likes + "\t\t👎 "+ question.dislikes + "\n"

		// get company tags from db
		const data = await getQuestionData(question.titleSlug)
		if(data) {
			const companyTagStats = JSON.parse(data.companyTagStats)
			message += "👨‍💻🪧 Company Tags:\n"
			message += "0 ~6m:"
			let dur1 = companyTagStats[1].slice(0,3)
			for(let i=0;i<dur1.length;++i)
				message += " "+ dur1[i].name + "("+ dur1[i].timesEncountered +"),"
			message += "\n"
			message += "6m ~1y:"
			let dur2 = companyTagStats[2].slice(0,3)
			for(let i=0;i<dur2.length;++i)
				message += " "+ dur2[i].name + "("+ dur2[i].timesEncountered +"),"
			message += "\n"
			message += "1y ~2y:"
			let dur3 = companyTagStats[3].slice(0,3)
			for(let i=0;i<dur3.length;++i)
				message += " "+ dur3[i].name + "("+ dur3[i].timesEncountered +"),"
			message += "\n\n"
		}
		
		message += link
		thread.send(message)
		console.log(`Created thread: ${thread.name}`);
		return interaction.deleteReply().catch(console.error);
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
	run,
}