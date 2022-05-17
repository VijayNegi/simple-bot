const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { getQuestionData } = require('./../database/mongodb.js')
// Just some constants
const LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql'

const ALL_QUESTION_QUERY = `
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
        total: totalNum
        questions: data {
            frontendQuestionId: questionFrontendId
            titleSlug
        }
    }
}`

const QUESTION_DATA_QUERY = `
query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        boundTopicId
        title
        titleSlug
        content
        translatedTitle
        translatedContent
        isPaidOnly
        difficulty
        likes
        dislikes
        isLiked
        similarQuestions
        categoryTitle
        topicTags {
            name
            slug
            translatedName
        }    
        companyTagStats
        stats
        status
    }
}`

const vars = {
	categorySlug: "",
	skip: 0,
	limit: 3000,
	filters: {},
}

const fetchAllProblems = async () => {
	console.log(`Fetching all LeetCode questions.`)

	const init = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query: ALL_QUESTION_QUERY,
								variables: vars }),
	}
	console.log(init.body)
	const response = await fetch(LEETCODE_API_ENDPOINT, init)
	return response.json()
}

const fetchProblemData = async (questionSlug) => {
	console.log(`Fetching single question data.`)

	const init = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({  operationName: "questionData",
							 	variables: { titleSlug: questionSlug, },
								query: QUESTION_DATA_QUERY }),
	}
	console.log(init.body)
	const response = await fetch(LEETCODE_API_ENDPOINT, init)
	return response.json()
}

const run = async (client, interaction) => {
	let qID = interaction.options.getNumber("questionid")
	if (!qID) return interaction.reply("You must provide a Question ID")
	// post question
	try {
		//interaction.deferReply();
		interaction.reply(` Posting Question with ID `+ qID)
		console.log(qID)
		const response  = await fetchAllProblems()
		let total  = response.data.problemsetQuestionList.total

		if(qID < 1 || qID > total)
			return interaction.reply("You must provide a Question ID in range 1 - " + total.toString())
		let qlist = response.data.problemsetQuestionList.questions
		var question_meta = qlist.filter(item => (item.frontendQuestionId === qID.toString()))[0]; // get first question

		if(!question_meta)
			return interaction.reply("Did not found that question in Leetcode")
		
		const data_response  = await fetchProblemData(question_meta.titleSlug)
		let question  = data_response.data.question
		var datetime = new Date();
		let qdate = datetime.toISOString().slice(0,10)
		let link = "https://leetcode.com/problems/"+ question.titleSlug
		const thread = await interaction.channel.threads.create({
			name: qdate,
			autoArchiveDuration: 1440,
			reason: 'A problem a day keeps you great',
		});

		let stats = JSON.parse(question.stats)
		let message = "LeetCodePractice : " + qdate + "\n\n"
		message += question.questionFrontendId + ".  " + question.title + "\n"
		message += "🧗 " + question.difficulty + " \t\t🎖️  "+ stats.acRate + "\n"
		message += "👍 "+ question.likes + "\t\t👎 "+ question.dislikes + "\n"

		// get company data from db
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
	name: "leetpostq",
	description: "Post Leetcode question with provided ID",
	options: [
		{
			name: "questionid",
			description: "Leetcode QuestionID",
			type: "NUMBER",
			required: true,
		},
	],
	run,
}