import knex from "knex";

declare module 'knex/types/tables' {
    interface Tables {
        transactions: {
            id: string;
            title: string;
            amounth: number;
            created_at: string,
            session_id?: string
        }
    }
}