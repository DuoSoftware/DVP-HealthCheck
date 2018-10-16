const async = require('async');

class HealthChecker {

    /*
    handler{
    pg: handler,
    redis: handler
    }


     */

    constructor(server, handlers) {
        this.server = server;
        this.handlers = handlers;

        if (this.handlers) {

            let {pg: pg, redis: redis, mongo: mongo} = this.handlers;
            this.functions = [];

            if (pg) {

                this.functions.push(function (callback) {
                    pg.authenticate().then((res) => {

                        callback(null, res);

                    }).catch(function (err) {

                        callback(err);

                    });
                })

            }

            if (redis) {

                this.functions.push(function (callback) {

                    redis.ping(function (err, result) {
                        callback(err, result);

                    });

                });
            }

            if (mongo) {

                this.functions.push(function (callback) {

                        if (mongo.readyState === 1) {
                            callback(null, {});
                        }
                        else {
                            callback(new Error('mongodb connection error'));
                        }

                    }
                )
            }
        }

    }


    Initiate() {

        if (this.server) {
            var self = this;
            this.server.get('/healthcheck',
                function (req, res, next) {
                    self.Check(function (err, result) {
                        if (err) {
                            res.status(500);
                            res.end(err);
                        }
                        else {
                            res.status(200);
                            res.end("healthcheck succeeded");
                        }
                        return next();
                    });
                });
        } else {

            throw new Error("Cannot initiate the health check!");

        }

    }

    Check(cb) {
        async.parallel(this.functions, function (err, results) {
            cb(err, results);

        });
    };

}

module.exports = HealthChecker;

