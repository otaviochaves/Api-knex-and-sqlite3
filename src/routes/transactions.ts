import { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import z from 'zod';
import { knex } from '../database';
import { checkSessionIdExists } from '../middlewares/check-session-id-exist';



export async function transactionsRoutes(app: FastifyInstance) {
    app.get("/", { preHandler: [checkSessionIdExists] }, async (request, reply) => {

        const { sessionId } = request.cookies

        const transactions = await knex('transactions')
            .where('session_id', sessionId)
            .select('*')
        return { transactions }
    })

    app.get("/:id", { preHandler: [checkSessionIdExists] }, async (request, reply) => {


        const createTransactionBodySchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = createTransactionBodySchema.parse(request.params)

        const { sessionId } = request.cookies

        const transaction = await knex('transactions')
            .where({
                session_id: sessionId,
                id
            }).first()
        return { transaction }
    })

    app.get('/summary', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies
        const summary = await knex('transactions')
            .where({ session_id: sessionId })
            .sum('amounth', { as: 'amount' })
            .first()
        return { summary }
    })

    app.post("/", async (request, reply) => {

        const createTransactionBodySchema = z.object({
            title: z.string(),
            amounth: z.number(),
            type: z.enum(['credit', 'debit']),
        })

        const { title, amounth, type } = createTransactionBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId;

        if (!sessionId) {
            sessionId = crypto.randomUUID();
            reply.cookie('sessionId', sessionId, {
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
                path: '/'
            })
        }

        await knex('transactions').insert({
            id: crypto.randomUUID(),
            title,
            amounth: type === 'credit' ? amounth : amounth * -1,
            session_id: sessionId
        })

        reply.status(201).send({ message: 'Transaction created successfully' });
    })


}