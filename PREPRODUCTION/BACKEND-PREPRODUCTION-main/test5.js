const { getRawDataDeliverySummaryQuery } = require('./src/queries/crm.queries');
getRawDataDeliverySummaryQuery('LD-04', false).then(res => {
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
