const { TypeCheck } = require('./helpers');

class APIFeatures {
  constructor(query, queryString, Model) {
    this.query = query;
    this.queryString = queryString;
    this.Model = Model;
  }

  filter() {
    if (!this.Model || !this.Model.schema) {
      throw new Error('Model is not defined or does not have a schema');
    }
    const fieldDataTypes = this.Model.schema.paths;
    const queryObj = { ...this.queryString };

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Filter for string fields with case-insensitive matching
    Object.keys(queryObj).forEach((key) => {
      if (!queryObj[key]) {
        delete queryObj[key];
      } else if (TypeCheck(queryObj[key]).isObject()) {
        queryObj[key] = JSON.parse(
          JSON.stringify(queryObj[key]).replace(
            /\b(gte|gt|lte|lt|eq|ne)\b/g,
            (match) => `$${match}`
          )
        );
      } else if (fieldDataTypes[key]?.instance === 'String') {
        queryObj[key] = {
          $regex: new RegExp(queryObj[key].replace(/([.*+?=^!:${}()|[\]/\\])/g, '\\$1'), 'i')
        };
      }
    });

    console.log(queryObj);
    this.query = this.query.find(queryObj);

    return this;
  }
}
module.exports = APIFeatures;
