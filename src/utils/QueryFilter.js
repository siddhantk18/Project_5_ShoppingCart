class QueryFilter {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    if (this.queryString.priceGreaterThan && !this.queryString.priceLessThan) {
      this.queryString.priceGreaterThan = {
        $gt: `${this.queryString.priceGreaterThan}`,
      };
    }
    if (this.queryString.priceLessThan && !this.queryString.priceGreaterThan) {
      this.queryString.priceLessThan = {
        $lt: `${this.queryString.priceLessThan}`,
      };
    }
    if (this.queryString.priceGreaterThan && this.queryString.priceLessThan) {
      this.queryString.priceLessThan = {
        $lt: `${this.queryString.priceLessThan}`,
        $gt: `${this.queryString.priceGreaterThan}`,
      };
      this.queryString.priceGreaterThan = {
        $lt: `${this.queryString.priceLessThan}`,
        $gt: `${this.queryString.priceGreaterThan}`,
      };
    }
    if (this.queryString.name) {
      this.queryString.name = {
        $regex: `${this.queryString.name}`,
      };
    }
    let queryStr = JSON.stringify(this.queryString);
    const filters = {
      size: "availableSizes",
      name: "title",
      priceGreaterThan: "price",
      priceLessThan: "price",
    };
    queryStr = queryStr.replace(
      /\b(size|name|priceGreaterThan|priceLessThan)\b/g,
      (match) => filters[match]
    );
    const queryObj = JSON.parse(queryStr);
    this.query = this.query.find(queryObj);

    return this;
  }

  sort() {
    if (this.queryString.priceSort) {
      this.query = this.query.sort({ price: this.queryString.priceSort });
    }
    return this;
  }
}
module.exports = QueryFilter;
