// Require needed modules
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var csvdb = require('csvdb');

// Require data models
var User = require('../schemas/user');
var Product = require('../schemas/product');
var Category = require("../schemas/category");

// Passport methods
passport.use(new LocalStrategy({usernameField: 'email'},function(email, password, done) {User.authenticate(email, password, function(err, user) {return done(err, user)})}));
passport.serializeUser(function(user, done) {done(null, user.id)});
passport.deserializeUser(function(id, done) {User.findById(id, function (err, user) {done(err, user)})});

// Export functions
module.exports = {

    // Connect to database
    startup: function(dbToUse) {

        // Connect mongoose and select db
        mongoose.connect(dbToUse);

        // Add listener for opened connection
        mongoose.connection.on('open', function() {
            console.log('Connected to MongoDB!');
        });
    },

    loadProductsFromCSV: function(source) {
        var db = csvdb(source, { autofetch : 5000 });

        db.on('fetch', function(curr, prev) {
          var modified = false;
          curr = db.entries;

          // check if anything changed
          modified = JSON.stringify(curr) !== JSON.stringify(prev);

          // if modified, purge collection and insert the new items
          if (modified) {
            Product.remove(function(err) {
              for (var key in curr) {
                var p = curr[key];
                var product = new Product({
                  _id: key,
                  name: p.name,
                  seo: p.seo,
                  picture: p.picture,
                  category: p.category,
                  pricing: {
                     retail: p.price,
                  },
                  details: {
                     description: p.description,
                  },
                  featured: p.featured,
                });
                product.save();
                modified = true;
              }
            });
          }

          if (modified) {
            console.log('csvdb was modified, updating db accordingly');
          }
        });
    },

    // Get categories for top nav
    getTopCategories: function(callback) {
        var query = Category.find({topnav : true});
        query.exec(function(err, categories) {

            // Execute callback
            callback(null, categories);
        });
    },

    // Get featured products
    getFeatured: function(callback) {

        // Find products where featured is true
        var query = Product.find({featured : true});
        query.exec(function(err, featuredProducts) {

            // Execute callback
            callback(null, featuredProducts);
        });
    },

    // Get products in a category
    getCategoryProducts: function(category, callback) {

        // Find category for url
        var categoryQuery = Category.findOne({seo : category});

        // Execute query
        categoryQuery.exec(function(err, category){

            // Callback with error if error
            if (err) return callback(err);

            // Check if category exists
            if (!category) {

                // Pass an error if not
                callback(new Error('Category not found!'));

            // Continue if it does
            } else {

                // Find products in given category
                var productQuery = Product.find({category : category.name});
                productQuery.exec(function(err, categoryProducts) {

                    // Execute callback passed from route
                    callback(err, categoryProducts, category.name);
                });
            }
        });
    },

    // Find product for url
    findProductBySEO: function(seo, callback) {
        var query = Product.findOne({seo : seo});
        query.exec(function(err, product) {

            // Check if product exists
            if (!product) {

                // Pass an error if not
                callback(new Error('Product not found!'));

            // Continue if it does
            } else {

                // Execute callback
                callback(null, product);
            }
        });
    },

    // Find product for ID
    findProductByID: function(id, callback) {

        // Find product where _id matches given ID
        var query = Product.findOne({_id : id});
        query.exec(function(err, product) {

            // Execute callback passed from route
            callback(null, product);
        });
    },

    // Save new user
    saveUser: function(userInfo, callback) {

        // Build user object
        var newUser = new User ({
            name : {
                first: userInfo.fname,
                last: userInfo.lname
            },
            address : {
                address1: userInfo.address1,
                address2: userInfo.address2,
                town: userInfo.town,
                province: userInfo.province,
                pcd: userInfo.pcd,
                country : userInfo.country
            },
            contactNum : userInfo.contactNum,
            email: userInfo.email,
            password: userInfo.password
        });

        console.log(newUser);

        // Save into database
        newUser.save(function(err) {
            if (err) {throw err;}

            // Execute callback passed from route
            callback(null, userInfo);
        });
    },

    // Close DB connection
    closeDB: function() {
        mongoose.disconnect();
    }
};
