const async = require('async');

class HealthChecker{

    /*
    handler{
    pg: handler,
    redis: handler
    }


     */

    constructor(server, handlers){
       this.server = server;
       this.handlers = handlers;

       if(handlers){

           let {pg: pg, redis: redis} = handlers;
           this.functions = [];

           if(pg){

               this.functions.push(  function (callback) {
                   pg.authenticate().then((res) => {

                       callback(null, res);

                   }).catch(function (err) {

                       callback(err);

                   });
               })

           }

           if(redis) {

               this.functions.push(function (callback) {

                   redis.ping(function (err, result) {

                       callback(err, result);

                   });

               });
           }
       }

    }

    Initiate(){

        if(this.server) {
            this.server.get('/healthcheck',
                function (req, res, next) {
                    this.Check(function (err, result) {
                        if (err) {
                            res.status(500);
                            res.end(err);
                        }
                        else {
                            res.status(200);
                            res.end("healthcheck succeeded");
                        }
                    });
                });
        }else{


        }

    }

    Check(cb) {
        async.parallel(this.functions, function(err, results) {
            cb(err, results);

        });
    };


}

