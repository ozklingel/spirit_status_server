const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const { HTTPStatus } = require('http-status-ts');
const { Cluster } = require('../models/cluster_model'); // Adjust paths
const { Region } = require('../models/region_model');
const { Apprentice } = require('../models/apprentice_model');
const { City } = require('../models/city_model');
const { Message } = require('../models/message_model');
const { Institution } = require('../models/institution_model');
const { Task } = require('../models/task_model_v2');
const { User } = require('../models/user_model');
const { Report } = require('../models/report_model');
const myPersonas = require('../logic/my_personas'); // Adjust path
const { validateDate, validateEmail, parsePayload } = require('./utils/validations'); // Adjust path
const sequelize = require('../sequelize'); // Adjust path

const userProfileFormRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// /program_managers
userProfileFormRouter.get('/program_managers', async (req, res) => {
    try {
        const managers = await myPersonas.getProgramManagers();
        res.status(HTTPStatus.OK).json(managers);
    } catch (err) {
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ result: err.message });
    }
});

// /delete
userProfileFormRouter.post('/delete', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findByPk(userId);
        const apprentice = await Apprentice.findByPk(userId);

        if (user) {
            await Message.destroy({ where: { created_for_id: userId } });
            await Message.destroy({ where: { created_by_id: userId } });
            await Report.destroy({ where: { ent_reported: userId } });
            await Report.destroy({ where: { user_id: userId } });
            await Task.destroy({ where: { userId: userId } });
            await User.destroy({ where: { id: userId } });
        } else if (apprentice) {
            await Task.destroy({ where: { subject_id: userId } });
            await Report.destroy({ where: { ent_reported: userId } });
            await Apprentice.destroy({ where: { id: userId } });
        } else {
            return res.status(HTTPStatus.BAD_REQUEST).json({ result: 'no such id' });
        }

        res.status(HTTPStatus.OK).json({ result: 'success' });
    } catch (err) {
        res.status(HTTPStatus.BAD_REQUEST).json({ result: err.message });
    }
});

// /update
userProfileFormRouter.put('/update', async (req, res) => {
    try {
        const userId = req.query.userId;
        const data = req.body;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(HTTPStatus.NOT_FOUND).json({ result: 'User not found' });
        }

        for (const key in data) {
            if (!User.rawAttributes[key]) {
                return res.status(HTTPStatus.BAD_REQUEST).json({ result: `Invalid attribute for ${key}` });
            }

            if (key === 'birthday') {
                if (validateDate(data[key])) {
                    user[key] = data[key];
                } else {
                    return res.status(HTTPStatus.BAD_REQUEST).json({ result: `Invalid date format for ${key}` });
                }
            } else if (key === 'email') {
                if (validateEmail(data[key])) {
                    user[key] = data[key];
                } else {
                    return res.status(HTTPStatus.BAD_REQUEST).json({ result: `Invalid email format for ${key}` });
                }
            } else if (key === 'role_ids') {
                if (Array.isArray(data[key]) && data[key].every(item => typeof item === 'number' && item >= 0 && item <= 3)) {
                    user[key] = data[key].join(',');
                } else {
                    return res.status(HTTPStatus.BAD_REQUEST).json({ result: `Invalid role_ids format for ${key}` });
                }
            } else if (key === 'institution') {
                const institution = await Institution.findOne({ where: { name: data[key] } });
                user.institution_id = institution ? institution.id : null;
            } else if (key === 'city') {
                const city = await City.findOne({ where: { name: data[key] } });
                user.city_id = city ? city.id : null;
            } else {
                user[key] = data[key];
            }
        }

        await user.save();
        res.status(HTTPStatus.OK).json({ result: 'success' });
    } catch (err) {
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ result: err.message });
    }
});

// /get_profile_attributes
userProfileFormRouter.get('/get_profile_attributes', async (req, res) => {
    try {
        const userId = req.query.userId;
        const user = await User.findByPk(userId);

        if (user) {
            const region = await Region.findByPk(user.region_id);
            const city = await City.findByPk(user.city_id);
            const attributes = user.toAttributes(city ? city.name : null, region ? region.name : null);
            res.status(HTTPStatus.OK).json(attributes);
        } else {
            res.status(HTTPStatus.OK).json({ results: 'no such id' });
        }
    } catch (err) {
        res.status(401).json({ result: err.message });
    }
});

async function getMyApprenticesNames(userId) {
    try {
        const apprentices = await Apprentice.findAll({
            where: { accompany_id: userId },
            attributes: ['id', 'name', 'last_name'],
        });
        return apprentices.map(apprentice => ({
            id: String(apprentice.id),
            name: apprentice.name,
            last_name: apprentice.last_name,
        }));
    } catch (err) {
        throw err;
    }
}
// /add_user_excel
userProfileFormRouter.put('/add_user_excel', upload.single('file'), async (req, res) => {
    try {
        const file = req.file.buffer;
        const workbook = XLSX.read(file, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 1 });
        const uncommittedIds = [];
        let index = 2;

        for (const row of data) {
            const phone = String(row[5]).replace(/-/g, '').trim();

            if (!row[0] || !row[1] || !row[2] || phone.length < 9 || !row[5]) {
                uncommittedIds.push(index);
                index++;
                continue;
            }

            let roleIds = '';
            if (String(row[2]).trim().includes('מלווה')) roleIds += '0,';
            if (String(row[2]).trim().includes('רכז מוסד')) roleIds += '1,';
            if (String(row[2]).trim().includes('רכז אשכול')) roleIds += '2,';
            if (String(row[2]).trim().includes('אחראי תוכנית')) roleIds += '3,';
            roleIds = roleIds.slice(0, -1);

            const firstName = String(row[0]).trim();
            const lastName = String(row[1]).trim();
            const institutionName = row[3] ? String(row[3]).trim() : null;
            const clusterName = row[4] ? String(row[4]).trim() : null;
            const email = row[6] ? String(row[6]).trim() : null;

            try {
                const institution = await Institution.findOne({ where: { name: institutionName } });
                const cluster = await Cluster.findOne({ where: { name: clusterName } });
                const id = parseInt(phone.slice(0, 9));
                let user = await User.findByPk(id);

                if (user) {
                    user.name = firstName;
                    user.lastName = lastName;
                    user.role_ids = roleIds;
                    user.email = email;
                    user.cluster_id = cluster ? cluster.id : null;
                    user.institution_id = institution ? institution.id : null;
                    await user.save();
                } else {
                    user = await User.create({
                        id: id,
                        name: firstName,
                        last_name: lastName,
                        role_ids: roleIds,
                        email: email,
                        cluster_id: cluster ? cluster.id : null,
                        institution_id: institution ? institution.id : null,
                    });
                }
                index++;
            } catch (err) {
                return res.status(HTTPStatus.BAD_REQUEST).json({ result: `error while inserting ${err.message}` });
            }
        }

        return res.status(HTTPStatus.OK).json({ result: 'success', not_commited: uncommittedIds });
    } catch (err) {
        return res.status(HTTPStatus.BAD_REQUEST).json({ result: `error while inserting ${err.message}` });
    }
});

// /add_user_manual
userProfileFormRouter.post('/add_user_manual', async (req, res) => {
    try {
        const data = req.body;
        const parsedPayload = parsePayload(data);

        if (typeof parsedPayload !== 'object') {
            return res.status(HTTPStatus.BAD_REQUEST).json({ result: `error ${parsedPayload}` });
        }

        const { first_name, last_name, phone, institution_id, role_ids, city_id } = parsedPayload;

        const user = await User.create({
            id: parseInt(phone.slice(1)),
            name: first_name,
            last_name: last_name,
            role_ids: role_ids,
            institution_id: institution_id,
            city_id: city_id || null,
            photo_path: 'https://www.gravatar.com/avatar',
        });

        return res.status(HTTPStatus.OK).json({ result: 'success' });
    } catch (err) {
        return res.status(HTTPStatus.BAD_REQUEST).json({ result: `error while inserting ${err.message}` });
    }
});

// /my_personas
userProfileFormRouter.get('/my_personas', async (req, res) => {
    try {
        const personas = await myPersonas.getPersonas(req.query.userId);
        return res.status(HTTPStatus.OK).json(personas);
    } catch (err) {
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ result: err.message });
    }
});

module.exports = userProfileFormRouter;