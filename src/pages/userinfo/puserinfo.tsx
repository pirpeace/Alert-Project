'use client'
import React, { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container';
import axios from 'axios';
import { useRouter } from 'next/router'

import styles from '@/styles/page.module.css'

import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

import InputLabel from '@/components/Form/InputLabel'
import TextareaLabel from '@/components/Form/TextareaLabel'
import ModalAlert from '@/components/Modals/ModalAlert'
import ButtonState from '@/components/Button/ButtonState';
import DatePickerX from '@/components/DatePicker/DatePickerX';

import { encrypt } from '@/utils/helpers'

interface UserData {
    isLogin: boolean;
    data   : UserDataProps | null;
}

interface UserTakecareData {
    isLogin : boolean;
    data    : UserTakecareProps | null;
    users_id: number | null;
}

const Puserinfo = () => {
    const router = useRouter();

    const [validated, setValidated]               = useState(false);
    const [alert, setAlert]                       = useState({ show: false, message: '' });
    const [isLoading, setLoading]                 = useState(false);
    const [user, setUser]                         = useState<UserData>({ isLogin: false, data: null })
    const [dataUser, setDataUser]                 = useState<UserTakecareData>({ isLogin: true, data: null, users_id: null });
    const [takecareBirthday, setTakecareBirthday] = useState<Date | null>(new Date());
    const [masterGender, setMasterGender] = useState<[]>([]);
    const [masterMarry, setMasterMarry] = useState<[]>([]);

    useEffect(() => {
        const auToken = router.query.auToken
        getMasterData()
        if (auToken) {
            onGetUserData(auToken as string)
        }
    }, [router.query.auToken])

    const getMasterData = async () => {
        try {
            const response1 = await axios.get(`${process.env.WEB_DOMAIN}/api/master/getGender`);
            const response2 = await axios.get(`${process.env.WEB_DOMAIN}/api/master/getMarry`);
            if (response1.data) {
                setMasterGender(response1.data.data)
            }
            if (response2.data) {
                setMasterMarry(response2.data.data)
            }
        } catch (error) {
            setAlert({ show: true, message: 'ไม่สามารถดึงข้อมูล Master ได้' })
        }
    }

    const onGetUserData = async (auToken: string) => {
        try {
            const responseUser = await axios.get(`${process.env.WEB_DOMAIN}/api/user/getUser/${auToken}`);
            if (responseUser.data?.data) {
                const encodedUsersId = encrypt(responseUser.data?.data.users_id.toString());
                const responseTakecareperson = await axios.get(`${process.env.WEB_DOMAIN}/api/user/getUserTakecareperson/${encodedUsersId}`);
                const data = responseTakecareperson.data?.data
                if(data){
                    setTakecareBirthday(new Date(data.takecare_birthday))
                }
                setDataUser({ isLogin: false, data, users_id: responseUser.data?.data.users_id })
                setUser({ isLogin: false, data: responseUser.data?.data })
            } else {
                setUser({ isLogin: false, data: null })
            }
        } catch (error) {
            console.log("🚀 ~ file: registration.tsx:66 ~ onGetUserData ~ error:", error)
            setUser({ isLogin: false, data: null })
            setAlert({ show: true, message: 'ระบบไม่สามารถดึงข้อมูลของท่านได้ กรุณาลองใหม่อีกครั้ง' })
        }
    }


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const form = event.currentTarget;
            if (!form.checkValidity()) {
                setAlert({ show: true, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
                return;
            }
            if(dataUser.data){
                const data = {
                    takecare_fname   : form['takecare_fname'].value,
                    takecare_sname   : form['takecare_sname'].value,
                    takecare_birthday: takecareBirthday,
                    gender_id        : Number(form['gender'].value),
                    marry_id         : Number(form['marry'].value),
                    takecare_number  : form['takecare_number'].value,
                    takecare_moo     : form['takecare_moo'].value,
                    takecare_road    : form['takecare_road'].value,
                    takecare_tubon   : form['takecare_tubon'].value,
                    takecare_amphur  : form['takecare_amphur'].value,
                    takecare_province: form['takecare_province'].value,
                    takecare_postcode: form['takecare_postcode'].value,
                    takecare_tel1    : form['takecare_tel1'].value,
                    takecare_disease : form['takecare_disease'].value,
                    takecare_drug    : form['takecare_drug'].value,

                }
                setLoading(true)
                const encodedUsersId = encrypt(dataUser.data.takecare_id.toString());
                await axios.post(`${process.env.WEB_DOMAIN}/api/user/updateUserTakecare/${encodedUsersId}`, data)
                onGetUserData(router.query.auToken as string)
                setAlert({ show: true, message: 'บันทึกข้อมูลสำเร็จ' })
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            setLoading(false)
            setAlert({ show: true, message: 'ไม่สามารถบันทึกข้อมูลได้' })
        } finally {
            setLoading(false)
            setValidated(true);
            event.stopPropagation();
        }
    };
    if (dataUser.isLogin) return <div>loading...</div>;

    return (
        <Container>
            <div className={styles.main}>
                <h1 className="py-2">ข้อมูลผู้สูงอายุ</h1>
            </div>
            <div className="px-5">
            <Form noValidate validated={validated} onSubmit={(e) => handleSubmit(e)}>
                    <Form.Group>
                        <InputLabel label="ชื่อ" id="takecare_fname" placeholder="กรอกชื่อ" required defaultValue={dataUser.data?.takecare_fname || ''} />
                    </Form.Group>
                    <Form.Group>
                        <InputLabel label="นามสกุล" id="takecare_sname" placeholder="กรอกนามสกุล" required defaultValue={dataUser.data?.takecare_sname || ''} />
                    </Form.Group>
                    <Form.Group>
                        <p className="m-0">วันเดือนปีเกิด</p>
                        <div className="py-2">
                            <DatePickerX selected={takecareBirthday} onChange={(date) => setTakecareBirthday(date)} />
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <p className="m-0">เพศ</p>
                        <div className="d-flex justify-content-around">
                            {
                                masterGender.length > 0 && masterGender.map((item: any, index: number) => {
                                    return (
                                        <Form.Check
                                            key={`${index}-gender`}
                                            label={item.gender_describe}
                                            name="gender"
                                            type={'radio'}
                                            value={item.gender_id}
                                            defaultChecked={dataUser.data?.gender_id ? (dataUser.data?.gender_id === item.gender_id ? true : false) : (index === 0 ? true : false) }
                                          
                                        />
                                    )
                                })
                            }
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <p className="m-0">สถานะการสมรส</p>
                        <div className="py-1">
                            {
                                masterMarry.length > 0 && masterMarry.map((item: any, index: number) => {
                                    return (
                                        <Form.Check
                                            key={`${index}-marry`}
                                            label={item.marry_describe}
                                            name="marry"
                                            type={'radio'}
                                            value={item.marry_id}
                                            defaultChecked={dataUser.data?.marry_id ? (dataUser.data?.marry_id === item.marry_id ? true : false) : (index === 0 ? true : false)}
                                          
                                        />
                                    )
                                })
                            }
                        </div>
                    </Form.Group>
                    <Form.Group>
                        <InputLabel label="เลขที่บ้าน" id="takecare_number" placeholder="123/12" max={10} defaultValue={dataUser.data?.takecare_number || ''}  />
                    </Form.Group>
                    <Form.Group>
                        <InputLabel label="หมู่" id="takecare_moo" placeholder="1" max={5} defaultValue={dataUser.data?.takecare_moo || ''}  />
                    </Form.Group>
                    <Form.Group>
                        <InputLabel label="ถนน" id="takecare_road" placeholder="-" defaultValue={dataUser.data?.takecare_road || ''}  />
                    </Form.Group>
                    <Form.Group>
                        <InputLabel label="ตำบล" id="takecare_tubon" placeholder="กรอกตำบล" defaultValue={dataUser.data?.takecare_tubon || ''}  />
                    </Form.Group>
                    <Form.Group>
                        <InputLabel label="อำเภอ" id="takecare_amphur" placeholder="กรอกอำเภอ" defaultValue={dataUser.data?.takecare_amphur || ''}  />
                    </Form.Group>
                    <Form.Group>
                        <InputLabel label="จังหวัด" id="takecare_province" placeholder="กรอกจังหวัด" defaultValue={dataUser.data?.takecare_province || ''}  />
                    </Form.Group>
                    <Form.Group>
                        <InputLabel label="รหัสไปรษณีย์" id="takecare_postcode" placeholder="กรอกรหัสไปรษณีย์" max={5} type="number" defaultValue={dataUser.data?.takecare_postcode || ''}  />
                    </Form.Group>
                    <Form.Group>
                        <InputLabel label="เบอร์โทรศัพท์" id="takecare_tel1" placeholder="กรอกเบอร์โทรศัพท์" max={12} defaultValue={dataUser.data?.takecare_tel1 || ''}  />
                    </Form.Group>
                    <Form.Group>
                        <InputLabel label="โรคประจำตัว" id="takecare_disease" placeholder="กรอกโรคประจำตัว" defaultValue={dataUser.data?.takecare_disease || ''}  />
                    </Form.Group>
                    <Form.Group>
                        <InputLabel label="ยาที่ใช้ประจำ" id="takecare_drug" placeholder="กรอกยาที่ใช้ประจำ" defaultValue={dataUser.data?.takecare_drug || ''}  />
                    </Form.Group>
                            <Form.Group className="d-flex justify-content-center py-3">
                                <ButtonState type="submit" className={styles.button} text={'บันทึก'} icon="fas fa-save" isLoading={isLoading} />
                            </Form.Group>
                </Form>
            </div>
            <ModalAlert show={alert.show} message={alert.message} handleClose={() => setAlert({ show: false, message: '' })} />
        </Container>
    )
}

export default Puserinfo