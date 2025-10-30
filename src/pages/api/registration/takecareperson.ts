
import { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import axios from "axios";
import prisma from '@/lib/prisma'
import { replyMessage, replyRegistration } from '@/utils/apiLineReply';
type Data = {
    message: string;
    data?: any;
}
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            if (req.body) {
                const body = req.body
                await prisma.takecareperson.create({
                    data: {
                        users_id         : body.users_id,
                        takecare_fname   : body.takecare_fname,
                        takecare_sname   : body.takecare_sname,
                        takecare_birthday: body.takecare_birthday,
                        gender_id        : Number(body.gender_id),
                        marry_id         : Number(body.marry_id),
                        takecare_number  : body.takecare_number,
                        takecare_moo     : body.takecare_moo,
                        takecare_road    : body.takecare_road,
                        takecare_tubon   : body.takecare_tubon,
                        takecare_amphur  : body.takecare_amphur,
                        takecare_province: body.takecare_province,
                        takecare_postcode: body.takecare_postcode,
                        takecare_tel1    : body.takecare_tel1,
                        takecare_disease : body.takecare_disease,
                        takecare_drug    : body.takecare_drug,
                        takecare_status  : 1
                    },
                })

            }
            return res.status(200).json({ message: 'success' })
        } catch (error) {
            console.log("🚀 ~ file: create.ts:31 ~ handle ~ error:", error)
            return res.status(400).json({ message: 'error', data: error })
        }

    } else {
        res.setHeader('Allow', ['POST'])
        res.status(400).json({ message: `วิธี ${req.method} ไม่อนุญาต` })
    }

}
