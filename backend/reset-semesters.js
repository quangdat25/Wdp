const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/WDP').then(async () => {
  try {
    const db = mongoose.connection.db;

    const spring = {
      startDate: new Date('2025-12-31T17:00:00Z'),
      endDate: new Date('2026-04-30T16:59:59.999Z'),
      renewalStartDate: new Date('2026-04-17T17:00:00Z'),
      renewalEndDate: new Date('2026-04-24T16:59:59.999Z'),
      bookingStartDate: new Date('2026-04-24T17:00:00Z'),
      bookingEndDate: new Date('2026-04-30T16:59:59.999Z')
    };

    const summer = {
      startDate: new Date('2026-04-30T17:00:00Z'),
      endDate: new Date('2026-08-31T16:59:59.999Z'),
      renewalStartDate: new Date('2026-08-17T17:00:00Z'),
      renewalEndDate: new Date('2026-08-24T16:59:59.999Z'),
      bookingStartDate: new Date('2026-08-24T17:00:00Z'),
      bookingEndDate: new Date('2026-08-31T16:59:59.999Z')
    };

    const fall = {
      startDate: new Date('2026-08-31T17:00:00Z'),
      endDate: new Date('2026-12-31T16:59:59.999Z'),
      renewalStartDate: new Date('2026-12-17T17:00:00Z'),
      renewalEndDate: new Date('2026-12-24T16:59:59.999Z'),
      bookingStartDate: new Date('2026-12-24T17:00:00Z'),
      bookingEndDate: new Date('2026-12-31T16:59:59.999Z')
    };

    await db.collection('semesters').updateOne(
      { year: 2026 },
      { $set: { spring, summer, fall } }
    );
    console.log('Reset OK');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
});
