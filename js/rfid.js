var operator = new EVT.Operator(OPERATOR_API_KEY);
operator.thng().read().then(function(thngs) {
  console.log('evr' + thngs);
});