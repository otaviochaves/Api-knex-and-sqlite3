import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'
import request from 'supertest'

describe('Transactions routes', () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(async () => {
        execSync('npm run knex migrate:rollback --all');
        execSync('npm run knex migrate:latest');
    })


    it('should be able to create a new transaction', async () => {
        await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction by Otávio',
                amounth: 100,
                type: 'credit'
            })
            .expect(201)
    })

    it('should be able to list all transactions', async () => {
        const createTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction by Otávio',
                amounth: 100,
                type: 'credit'
            });


        const cookies = createTransactionResponse.get('Set-Cookie');

        if (!cookies) {
            throw new Error('No cookies set');
        }

        const listTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200);

        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New transaction by Otávio',
                amounth: 100
            })
        ]);
    });


    it('should be able to get a specific transactions', async () => {
        const createTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction by Otávio',
                amounth: 100,
                type: 'credit'
            });


        const cookies = createTransactionResponse.get('Set-Cookie');

        if (!cookies) {
            throw new Error('No cookies set');
        }

        const listTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200);

        const transactionId = listTransactionsResponse.body.transactions[0].id

        const getTransactionsResponse = await request(app.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies)
            .expect(200);

        expect(getTransactionsResponse.body.transaction).toEqual(
            expect.objectContaining({
                title: 'New transaction by Otávio',
                amounth: 100
            })
        );
    });


    it('should be able to get the summary', async () => {
        const createTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'Credit transaction',
                amounth: 1000,
                type: 'credit'
            });

        const cookies = createTransactionResponse.get('Set-Cookie');

        if (!cookies) {
            throw new Error('No cookies set');
        }

        await request(app.server)
            .post('/transactions')
            .set('Cookie', cookies)
            .send({
                title: 'Debit transaction ',
                amounth: 500,
                type: 'debit'
            });


        const summaryResponse = await request(app.server)
            .get('/transactions/summary')
            .set('Cookie', cookies)
            .expect(200);

        expect(summaryResponse.body.summary).toEqual({
            amount: 500,
        })
    });

})


