const pg = require("pg");

function setPgTypes() {
    pg.types.setTypeParser(pg.types.builtins.INT8, (value) => {
        return parseInt(value);
    });
    pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value) => {
        return parseFloat(value);
    });
    pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) => {
        return parseFloat(value);
    });
}

exports.setPgTypes = setPgTypes;
