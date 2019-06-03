// CUSTOM MODULES
const { pingLoop, tcpLoop } = require("./network")
const { httpFetch, addressPatchLoop } = require("./http")


// SCAN 'SYNC' FUNCTION
var scanAsync = async function (baseUrl, path, query, jwt, ports){
    try {
        // FETCH FUNCTION
        const getAddresses = await httpFetch(baseUrl, path, true, query, 'GET', jwt)
        const body = getAddresses.body
        // debugging 
        // console.log('httpFetch body:', body);
        
        // PING FUNCTION 
        const resultPing = await pingLoop(body)
        // debugging
        // console.log({result: resultPing})
        
        // PATCH FUNCTION
        const resultAddresses = await addressPatchLoop(resultPing, baseUrl, path, '?available=', jwt)
        const after = resultAddresses.filter(post => post.isAvailable === true)
        // debugging
        // console.log(after)

        // TCP FUNCTION CHECK 
        const resultTcp = await tcpLoop(after, ports)
        // debugging
        // console.log(resultTcp)
        const set = new Set(resultTcp)
        const array = [...set]
        // debugging
        // console.log(array)
        const objects = []
        array.forEach(element => {
            const object = {
                id: element.split(':')[0],
                host: element.split(':')[1],
                alive: element.split(':')[2] === 'true'
            }
            objects.push(object)
        })
        if(objects.length > 0){
            // PATCH ADDRESSES, FINAL CHECK UNTIL DNS TESTING
            // debugging
            console.log(objects)
            const resultAddresses = await addressPatchLoop(objects, baseUrl, path, '?available=', jwt)
            // debugging
            // console.log(resultAddresses)
        }

    } catch (e) {
        console.log('scan(), catch')
        console.error(e)
    } finally {

        // COMPLETED
        console.log({info:'Scanner Completed'})
    }
}


module.exports = scanAsync