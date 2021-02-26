const { FormControlStatic } = require('react-bootstrap');

const Image = artifacts.require("Image");

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Image', (accounts) => {
    let image

    before(async () => {
        image = await Image.deployed()
    })

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = image.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
    })

    describe('storage', async () => {
        it('updates the imageHash', async () => {
            let imageHash
            imageHash = 'abc123'
            await image.set(imageHash)
            const result = await image.get()
            assert.equal(result, imageHash)
        })
    })
})
