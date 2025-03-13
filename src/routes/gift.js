const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const { Gift } = require('../models/gift_model'); // Adjust path
const { Task } = require('../models/task_model_v2'); // Adjust path
const sequelize = require('../sequelize'); // Adjust path

const giftRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store in memory

// /add_giftCode_excel
giftRouter.put('/add_giftCode_excel', upload.single('file'), async (req, res) => {
  try {
    const file = req.file.buffer; // Access the file buffer
    const workbook = XLSX.read(file, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 1 }); // Skip header row
    const notCommitted = [];

    for (let i = 0; i < data.length; i++) {
      const code = data[i][0];
      if (!code) {
        notCommitted.push(i);
        continue;
      }

      const gift = Gift.build({ code: code, was_used: false });
      try {
        await gift.save();
      } catch (err) {
        console.error(i, err.message);
      }
    }

    res.status(200).json({ result: 'success', not_commited: notCommitted });
  } catch (err) {
    res.status(400).json({ result: err.message });
  }
});

// /getGift
giftRouter.get('/getGift', async (req, res) => {
  try {
    const gift = await Gift.findOne({ where: { was_used: false } });
    if (!gift) {
      res.status(200).json({ result: 'no code available' });
    } else {
      res.status(200).json({ result: gift.code });
    }
  } catch (err) {
    res.status(400).json({ result: 'error occurred when reading code: ' + err.message });
  }
});

// /delete
giftRouter.put('/delete', async (req, res) => {
  try {
    const giftCode = req.query.giftCode;
    const apprenticeId = req.query.apprenticeId; // corrected from '' to apprenticeId
    const gift = await Gift.findOne({ where: { code: giftCode } });

    if (gift) {
      gift.was_used = true;
      await gift.save();
      await Task.destroy({
        where: {
          subject: apprenticeId,
          event: 'יומהולדת',
        },
      });
    }

    res.status(200).json({ result: 'success' });
  } catch (err) {
    res.status(400).json({ result: err.message });
  }
});

// /deleteAll
giftRouter.put('/deleteAll', async (req, res) => {
  try {
    await Gift.destroy({ where: {} });
    res.status(200).json({ result: 'success' });
  } catch (err) {
    res.status(400).json({ result: err.message });
  }
});

// /getGifts_cnt
giftRouter.get('/getGifts_cnt', async (req, res) => {
  try {
    const allGifts = await Gift.findAll();
    const usedGifts = await Gift.findAll({ where: { was_used: true } });
    const allCount = allGifts.length;
    const usedCount = usedGifts.length;

    res.status(200).send(`מומשו ${usedCount} מתוך ${allCount} קודי מתנה`);
  } catch (err) {
    res.status(400).json({ result: err.message });
  }
});

module.exports = giftRouter;