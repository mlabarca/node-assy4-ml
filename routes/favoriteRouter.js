const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorites');
const favoriteRouter = express.Router();
const authenticate = require('../authenticate');
const cors = require('./cors');

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
  Favorites.find({})
  .populate('dishes user')
  .then((favorites) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(favorites);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOne({user: req.user.id})
  .populate('dishes user')
  .then((favorite) => {
    if (favorite){
      console.log('Favorite list exists!');
      req.body.dishes.forEach((dish) => {
        const existingDish = favorite.dishes.find((listDish) => {
          return listDish.id === dish['_id'];
        })
        if (!existingDish){
          console.log('adding new dish,', dish['_id']);
          favorite.dishes.push(dish);
        }
      });
      return favorite.save();
    } else {
      console.log(req.body.dishes);
      return Favorites.create({user: req.user.id, dishes: req.body.dishes});
    }
  }, (err) => next(err))
  .then((favorite) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(favorite);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOneAndRemove({user: req.user.id})
  .then((favorite) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(favorite);
  }, (err) => next(err))
  .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOne({user: req.user.id})
  .populate('dishes user')
  .then((favorite) => {
    if (favorite){
      console.log('Favorite list exists!');
      const existingDish = favorite.dishes.find((listDish) => {
        return listDish.id === req.params.dishId;
      })
      if (!existingDish){
        console.log('adding new specific dish,', req.params.dishId);
        favorite.dishes.push({'_id': req.params.dishId});
      }
      return favorite.save();
    } else {
      res.statusCode = 404;
      next(err);
    }

  }, (err) => next(err))
  .then((favorite) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(favorite);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOne({user: req.user.id})
  .populate('dishes user')
  .then((favorite) => {
    if (favorite){
      favorite.dishes = favorite.dishes.filter(e => e.id !== req.params.dishId)
      return favorite.save();
    } else {
      res.statusCode = 404;
      next(err);
    }
  }, (err) => next(err))
  .then((favorite) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(favorite);
  }, (err) => next(err))
  .catch((err) => next(err));
});

module.exports = favoriteRouter;
