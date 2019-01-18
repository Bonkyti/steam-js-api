const api = require ('./../app.js')

const assert = require('assert')
const util = require('util')

const key = require('./../env.json').key
const steamID = '76561198099490962'

let count = 0
let passed = 0

async function test(name, func) {
    count++
    console.log('\x1b[33mRunning \x1b[36m%s\x1b[0m', name)
    let duration = process.uptime()
    try {
        await func()
        console.log(' \x1b[32mPassed \x1b[36m%s\x1b[32m (' + Math.floor((process.uptime() - duration) * 1000) + 'ms)\x1b[0m\n', name)
        passed++
    } catch (e) {
        console.error('   \x1b[31m%s\x1b[0m', `Test ${name} failed with error:\n${e.stack || util.inspect(e)}\n`)
    }
}

async function run() {
    try {

        await test('Basic Request', async function() {
            let {statusCode, headers, data, error} = await api.request('ISteamUser/ResolveVanityURL/v1', {key, vanityurl: 'almic'})

            assert.strictEqual(statusCode, 200, `Status code ${statusCode}`)
            assert.strictEqual(data.response.steamid, steamID, `Returned Steam ID '${data.response.steamid}' does not match expected '${steamID}'`)
            assert.ok(data.response.success, `Success value not truthy, got ${data.response.success} instead`)
        })


        await test('getRecentlyPlayedGames', async function() {
            api.setKey(key)

            let result = await api.getRecentlyPlayedGames(steamID)

            assert.strictEqual(result.error, undefined, `Error received: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)
        })

        await test('getOwnedGames', async function() {
            api.setKey(key)

            let appIDs = [730, 4000, 220]
            let result = await api.getOwnedGames(steamID, appIDs, true)

            assert.strictEqual(result.error, undefined, `Error received: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)
            assert.strictEqual(result.data.count, 3, `Expected exactly 3 games, got ${result.data.count} instead`)

            for (index in result.data.games) {
                let game = result.data.games[index]
                if (!appIDs.includes(game.appid)) {
                    throw new assert.AssertionError({message: `Expected app id ${game.appid} to be one of ${appIDs}`, actual: false, expected: true})
                }
                assert.ok(game.name, `Expected name for game ${game.appid}, got ${JSON.stringify(game.name)} instead`)
            }
        })

        await test('getSteamLevel', async function() {
            api.setKey(key)

            let result = await api.getSteamLevel(steamID)

            assert.strictEqual(result.error, undefined, `Error recieved: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)
            assert.ok(result.data.level, `Expected positive level, result was ${util.inspect(result.data)}`)
        })

        await test('getBadges', async function () {
            api.setKey(key)

            let result = await api.getBadges(steamID)

            assert.strictEqual(result.error, undefined, `Error recieved: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)

            let player = result.data

            assert.ok(player.level, `Expected positive level, result was ${util.inspect(player)}`)
            assert.ok(player.badges, `Expected 'truthy' badges object, result was ${util.inspect(player)}`)

            let badges = player.badges

            assert.ok(badges.game, `Expected 'truthy' game object, result was ${util.inspect(badges)}`)
            assert.ok(badges.game[730], `Expected app id '730' to be in game object, result was ${util.inspect(badges.game)}`)
            assert.strictEqual(badges.game[730].appid, 730, `Expected app id '730' to be in the '730' object, result was ${util.inspect(badges.game[730])}`)

            assert.ok(badges.event, `Expected 'truthy' event object, result was ${util.inspect(badges)}`)
            assert.ok(badges.event['winter-2018'], `Expected 'winter-2018' to be in event object, result was ${util.inspect(badges.event)}`)
            assert.strictEqual(badges.event['winter-2018'].appid, 991980, `Expected app id '991980' to be in 'winter-2018' object, result was ${util.inspect(badges.event['winter-2018'])}`)

            assert.ok(badges.special, `Expected 'truthy' special object, result was ${util.inspect(badges)}`)
            assert.ok(badges.special.years, `Expected 'years' to be in special object, result was ${util.inspect(badges.special)}`)
            assert.strictEqual(badges.special.years.earned, 1374542223, `Expected earned time of '1374542223' in years object, result was ${util.inspect(badges.special.years)}`)
        })

        await test('getBadgeProgress', async function () {
            api.setKey(key)

            let result = await api.getBadgeProgress(steamID, 'awards-2018')

            assert.strictEqual(result.error, undefined, `Error recieved: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)

            let data = result.data

            assert.ok(data.quests, `Expected 'truthy' quest object, result was ${util.inspect(data)}`)
            assert.strictEqual(data.count, 4, `Expected 4 quests, result was ${util.inspect(data)}`)
            assert.strictEqual(data.completed, 0, `Expected 0 completed, result was ${util.inspect(data)}`)
        })

        await test('getFriendList', async function () {
            api.setKey(key)

            let result = await api.getFriendList(steamID, true)

            assert.strictEqual(result.error, undefined, `Error recieved: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)

            let data = result.data

            assert.ok(data.count, `Expected positive friend count, result was ${util.inspect(data)}`)
            assert.ok(data.friends, `Expected 'truthy' friends array, result was ${util.inspect(data)}`)
            assert.ok(data.friends[0], `Expected first friend in array, result was ${util.inspect(data.friends)}`)
            assert.ok(data.friends[0].steamID, `Expected steam id for first friend, result was ${util.inspect(data.friends[0])}`)
        })

        await test('getPlayerBans', async function () {
            api.setKey(key)

            let result = await api.getPlayerBans(steamID)

            assert.strictEqual(result.error, undefined, `Error recieved: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)

            let data = result.data

            assert.ok(data.count, `Expected positive player count, result was ${util.inspect(data)}`)
            assert.ok(data.players, `Expected 'truthy' player array, result was ${util.inspect(data)}`)
            assert.ok(data.players[steamID], `Expected one player in array, result was ${util.inspect(data.players)}`)
            assert.ok(!data.players[steamID].vac, `*Laughs nervously* what happened :'(`)
        })

        await test('getPlayerSummaries', async function () {
            api.setKey(key)

            let result = await api.getPlayerSummaries(steamID)

            assert.strictEqual(result.error, undefined, `Error recieved: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)

            let data = result.data

            assert.ok(data.count, `Expected positive player count, result was ${util.inspect(data)}`)
            assert.ok(data.players, `Expected 'truthy' player array, result was ${util.inspect(data)}`)
            assert.ok(data.players[steamID], `Expected one player in array, result was ${util.inspect(data.players)}`)

            let player = data.players[steamID]

            assert.ok(player.name, `Expected value 'name' in player object, result was ${util.inspect(player)}`)
            assert.ok(player.realName, `Expected value 'realName' in player object, result was ${util.inspect(player)}`)
            assert.ok(player.url, `Expected value 'url' in player object, result was ${util.inspect(player)}`)
            assert.strictEqual(typeof player.state, 'number', `Expected value 'state' to be a Number in player object, result was ${util.inspect(player)}`)
            assert.ok(player.stateString, `Expected value 'stateString' in player object, result was ${util.inspect(player)}`)
            assert.ok(player.public, `Expected value 'public' to be true in player object, result was ${util.inspect(player)}`)
            assert.ok(player.comments, `Expected value 'comments' to be true in player object, result was ${util.inspect(player)}`)
            assert.ok(player.joined, `Expected value 'joined' in player object, result was ${util.inspect(player)}`)
            assert.ok(player.offline, `Expected value 'offline' in player object, result was ${util.inspect(player)}`)
            assert.ok(player.community, `Expected value 'community' to be true in player object, result was ${util.inspect(player)}`)
            assert.ok(player.group, `Expected value 'group' to be truthy in player object, result was ${util.inspect(player)}`)
            assert.strictEqual(typeof player.inGame, 'boolean', `Expected value 'inGame' to be a Boolean in player object, result was ${util.inspect(player)}`)
            assert.strictEqual(typeof player.appid, 'number', `Expected value 'appid' to be a Number in player object, result was ${util.inspect(player)}`)
            assert.strictEqual(typeof player.appName, 'string', `Expected value 'appName' to be a String in player object, result was ${util.inspect(player)}`)
            assert.ok(player.avatar, `Expected value 'avatar' in player object, result was ${util.inspect(player)}`)
            assert.ok(player.avatar.small, `Expected value 'avatar.small' in player object, result was ${util.inspect(player.avatar)}`)
            assert.ok(player.avatar.medium, `Expected value 'avatar.medium' in player object, result was ${util.inspect(player.avatar)}`)
            assert.ok(player.avatar.large, `Expected value 'avatar.large' in player object, result was ${util.inspect(player.avatar)}`)
            assert.ok(player.location, `Expected value 'location' in player object, result was ${util.inspect(player)}`)
            assert.ok(player.location.country !== undefined, `Expected value 'location.country' to be defined in player object, result was ${util.inspect(player.location)}`)
            assert.ok(player.location.state !== undefined, `Expected value 'location.state' to be defined in player object, result was ${util.inspect(player.location)}`)
            assert.ok(player.location.city !== undefined, `Expected value 'location.city' to be defined in player object, result was ${util.inspect(player.location)}`)
            assert.ok(player.location.countryCode !== undefined, `Expected value 'location.countryCode' to be defined in player object, result was ${util.inspect(player.location)}`)
            assert.ok(player.location.stateCode !== undefined, `Expected value 'location.stateCode' to be defined in player object, result was ${util.inspect(player.location)}`)
            assert.ok(player.location.cityCode !== undefined, `Expected value 'location.cityCode' to be defined in player object, result was ${util.inspect(player.location)}`)
        })

        await test('getUserGroups', async function () {
            api.setKey(key)

            let result = await api.getUserGroups(steamID)

            assert.strictEqual(result.error, undefined, `Error recieved: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)

            let data = result.data

            assert.ok(data.groups, `Expected 'truthy' groups array, result was ${util.inspect(data)}`)
            assert.ok(data.groups[0], `Expected 'truthy' first group id, result was ${util.inspect(data)}`)
        })

        await test('resolveName', async function () {
            api.setKey(key)

            let result = await api.resolveName('almic')

            assert.strictEqual(result.error, undefined, `Error recieved: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)

            let data = result.data

            assert.strictEqual(data.id, steamID, `Expected resolved id to match '${steamID}', result was ${util.inspect(data)}`)
        })

        await test('getGroupInfo', async function () {
            let result = await api.getGroupInfo('103582791435315066')

            assert.strictEqual(result.error, undefined, `Error recieved: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)

            let data = result.data

            assert.ok(data.gid, `Expected value 'gid' in group object, result was ${util.inspect(data)}`)
            assert.ok(data.name, `Expected value 'name' in group object, result was ${util.inspect(data)}`)
            assert.ok(data.vanityName, `Expected value 'vanityName' in group object, result was ${util.inspect(data)}`)
            assert.ok(data.summary, `Expected value 'summary' in group object, result was ${util.inspect(data)}`)
            assert.ok(data.members, `Expected value 'members' in group object, result was ${util.inspect(data)}`)
            assert.ok(data.membersReal, `Expected value 'membersReal' in group object, result was ${util.inspect(data)}`)
            assert.ok(data.membersOnline, `Expected value 'membersOnline' in group object, result was ${util.inspect(data)}`)
            assert.ok(data.membersGame, `Expected value 'membersGame' in group object, result was ${util.inspect(data)}`)
            assert.ok(data.membersChat, `Expected value 'membersChat' in group object, result was ${util.inspect(data)}`)
            assert.ok(data.logo, `Expected value 'logo' in group object, result was ${util.inspect(data)}`)
            assert.ok(data.logo.small, `Expected value 'logo.small' in group object, result was ${util.inspect(data.logo)}`)
            assert.ok(data.logo.medium, `Expected value 'logo.medium' in group object, result was ${util.inspect(data.logo)}`)
            assert.ok(data.logo.large, `Expected value 'logo.large' in group object, result was ${util.inspect(data.logo)}`)
        })

        await test('getGlobalAchievements', async function () {
            let result = await api.getGlobalAchievements(730)

            assert.strictEqual(result.error, undefined, `Error recieved: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)

            let data = result.data

            assert.ok(data.achievements, `Expected 'truthy' achievements object, result was ${util.inspect(data)}`)
            assert.ok(data.achievements.KILLING_SPREE, `Expected 'KILLING_SPREE' in achievements object, result was ${util.inspect(data.achievements)}`)
        })

        await test('getCurrentPlayers', async function () {
            let result = await api.getCurrentPlayers(730)

            assert.strictEqual(result.error, undefined, `Error recieved: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)

            let data = result.data

            assert.strictEqual(typeof data.players, 'number', `Expected number of players, result was ${util.inspect(data)}`)
        })

        await test('getAchievements', async function () {
            api.setKey(key)

            let result = await api.getAchievements(steamID, 264710)

            assert.strictEqual(result.error, undefined, `Error recieved: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)

            let data = result.data

            assert.strictEqual(typeof data.count, 'number', `Expected 'count' to be a number in data, result was ${util.inspect(data)}`)
            assert.strictEqual(typeof data.name, 'string', `Expected 'name' to be a string in data, result was ${util.inspect(data)}`)
            assert.ok(data.achievements, `Expected 'truthy' achievements object, result was ${util.inspect(data)}`)
            assert.ok(data.achievements.BuildSeamoth, `Expected 'BuildSeamoth' to be in achievements object, result was ${util.inspect(data.achievements)}`)
            assert.ok(data.achievements.BuildSeamoth.unlocked, `Expected 'BuildSeamoth' to be unlocked in achievements object, result was ${util.inspect(data.achievements.BuildSeamoth)}`)
        })

        await test('getGameSchema', async function () {
            api.setKey(key)

            let result = await api.getGameSchema(264710)

            assert.strictEqual(result.error, undefined, `Error recieved: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)

            let data = result.data

            assert.strictEqual(typeof data.statCount, 'number', `Expected 'statCount' to be a number in data, result was ${util.inspect(data)}`)
            assert.strictEqual(typeof data.achievementCount, 'number', `Expected 'achievementCount' to be a number in data, result was ${util.inspect(data)}`)
            assert.strictEqual(typeof data.name, 'string', `Expected 'name' to be a string in data, result was ${util.inspect(data)}`)
            assert.ok(data.achievements, `Expected 'truthy' achievements object, result was ${util.inspect(data)}`)
            assert.ok(data.achievements.BuildSeamoth, `Expected 'BuildSeamoth' to be in achievements object, result was ${util.inspect(data.achievements)}`)
            assert.ok(data.achievements.BuildSeamoth.displayName, `Expected 'BuildSeamoth' to have a display name in achievements object, result was ${util.inspect(data.achievements.BuildSeamoth)}`)
            assert.ok(data.stats, `Expected 'truthy' stats object, result was ${util.inspect(data)}`)
            assert.ok(data.stats.s1_AllTimeDepth, `Expected 's1_AllTimeDepth' to be in stats object, result was ${util.inspect(data.stats)}`)
            assert.ok(data.stats.s1_AllTimeDepth.displayName, `Expected 's1_AllTimeDepth' to have a display name in stats object, result was ${util.inspect(data.stats.s1_AllTimeDepth)}`)
        })

        await test('getStats', async function () {
            api.setKey(key)

            let result = await api.getStats(steamID, 730)

            assert.strictEqual(result.error, undefined, `Error recieved: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)

            let data = result.data

            assert.strictEqual(data.name, 'ValveTestApp260', `Thanks Volvo, you finally fixed this (I hope). Name was: ${data.name}`)
            assert.strictEqual(typeof data.count, 'number', `Expected 'count' to be a number in data, result was ${util.inspect(data)}`)
            assert.ok(data.stats, `Expected 'truthy' stats object, result was ${util.inspect(data)}`)
            assert.ok(data.stats.kills, `Expected 'kills' to be in stats object, result was ${util.inspect(data.stats)}`)
            assert.ok(data.stats.bombs, `Expected 'bombs' to be in stats object, result was ${util.inspect(data.stats)}`)
            assert.ok(data.stats.bombs.defused, `Expected 'defused' to be in bombs object, result was ${util.inspect(data.stats.bombs)}`)
        })

        await test('getStats #2', async function () {
            api.setKey(key)

            let result = await api.getStats(steamID, 264710)

            assert.strictEqual(result.error, undefined, `Error recieved: ${result.error}`)
            assert.ok(result.data, `Expected 'truthy' data object, result was ${util.inspect(result, 0, null, 1)}`)

            let data = result.data

            assert.strictEqual(data.name, 'Subnautica', `Expected name to be 'Subnautica', result was ${data.name}`)
            assert.strictEqual(typeof data.count, 'number', `Expected 'count' to be a number in data, result was ${util.inspect(data)}`)
            assert.ok(data.stats, `Expected 'truthy' stats object, result was ${util.inspect(data)}`)
            assert.ok(data.stats.s1_AllTimeDepth, `Expected 's1_AllTimeDepth' to be in stats object, result was ${util.inspect(data.stats)}`)
            assert.ok(data.stats.s2_HasTank, `Expected 's2_HasTank' to be in stats object, result was ${util.inspect(data.stats)}`)
        })

    } catch (e) {
        console.error(e)
    }
}

async function main() {

    let duration = process.uptime()

    await run()

    console.log('\x1b[36m%s\x1b[0m', `Ran ${count} tests, ${passed} passed. Run time ${Math.floor((process.uptime() - duration) * 1000)}ms`)
}

main()
