const model = require('./model');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const _ = require('underscore');
const ArrayService = require('./array_util');

exports.getPersons = async function (request, response) {
  const persons = await model.Person.findAll();
  response.json(persons);
};
