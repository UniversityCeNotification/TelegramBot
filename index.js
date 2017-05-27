require('dotenv').config()
const mongoose = require('mongoose')
const TelegramBot = require('node-telegram-bot-api')
const token = process.env.TelegramToken
const bot = new TelegramBot(token, {polling: true})
const schedule = require('node-schedule')
const User = require('./models/User')
const Crawler = require('./models/Crawler')
mongoose.connect(process.env.MongoDbUri || process.env.MongoDbUrl || 'mongodb://localhost/universityce')

let sites = ['ytuce.maliayas.com']

console.log('[+] Nodejs Bot Program Started')
// Matches /createuser [whatever]
bot.onText(/\/start/, (msg, match) => {
  var fromId = msg.from.id
  console.log('[+] Runned /start command')
  User.find({id: fromId}, (err, user) => {
    if (err) throw err
    if (user.length === 0) {
      const newUser = new User({
        id: msg.from.id,
        username: msg.from.username,
        firstname: msg.from.first_name,
        lastname: msg.from.last_name,
        createdAt: Date.now()
      })
      newUser.save((err) => {
        if (err) throw err
        bot.sendMessage(fromId, 'User created successfully')
      })
    } else {
      bot.sendMessage(fromId, 'User already exists')
    }
  })
})

bot.onText(/\/listsite/, (msg, match) => {
  console.log('[+] Runned /listsites command')
  let fromId = msg.from.id
  let message = ''
  sites.forEach((site) => {
    message = message + site + '\n'
  })
  bot.sendMessage(fromId, message)
})

bot.onText(/\/setsite (.+)/, (msg, match) => {
  console.log('[+] Runned /setsite command')
  let fromId = msg.from.id
  let tracksite = match[1]
  console.log(tracksite)
  if (sites.indexOf(tracksite) >= 0) {
    User.find({id: fromId}, (err, user) => {
      if (err) throw err
      if (user.length === 0) {
        bot.sendMessage(fromId, 'User doesnt exists')
      } else {
        User.findOneAndUpdate({id: fromId}, {trackSite: tracksite}, (err) => {
          if (err) throw err
          bot.sendMessage(fromId, 'Updated trackSite field')
        })
      }
    })
  } else {
    bot.sendMessage(fromId, 'Please select site in listsite')
  }
})

bot.onText(/\/help/, (msg, match) => {
  console.log('[+] Runned /help command')
  let fromId = msg.from.id
  let message = `
  # CommandList
  /setsite <yoursite>  -> Seting your track site
  /listsite -> Listing available track sites
  /help -> Help me!
  First creating user and then setsite, after that notification start
  `
  bot.sendMessage(fromId, message)
})

let j = schedule.scheduleJob('* * * * *', function (){
  console.log('Checking MongoDb for new Link, every 5 minute')
  User.find({}, (err, users) => {
    if (err) throw err
    console.log('Users: ', users)
    if (users.length !== 0) {
      Crawler.find({'status': 'new'}).sort({date: 1}).exec((err, items) => {
        if (err) throw err
        for (let item of items) {
          let message = `*Author:*\n*${item.authorName}*\n-> ${item.authorLink}\n*Title:*\n*${item.titleName}*\n-> ${item.titleLink}\n*Content:*\n${item.content}\n*CrawlingDate:* ${item.date} - *Clock:* ${item.clock}`
          // console.log('Created Item Message: ', message)
          for (let user of users) {
            if (user.trackSite === item.site) {
              bot.sendMessage(user.id, message, {'parse_mode': 'Markdown'})
            }
          }
          Crawler.update({'id': item.id}, {$set: {'status': 'old'}}, {upsert: true}, () => {})
        }
      })
    }
  })
})
