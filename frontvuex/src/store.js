import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    users: []
  },
  mutations: {
    addUser(state, newUser) {
      state.users.push(newUser)
    },
    changeUser(state, {login, newUser}) {
      // let userIndex = state.users.findIndex(u => u.login === login); // or below
      // let userIndex = _.findIndex(state.users, {login: login});
      // if (userIndex === -1) {
      //   state.users.push(newUser);
      // } else {
      //   state.users.splice(userIndex, 1, Object.assign({login}, newUser));
      // }
      _.pullAllBy(state.users, [{login}], 'login');
      state.users.push(_.assign({login}, newUser));
    }
  },
  actions: {
    getUser(context, {login}) {
      return new Promise((resolve) => {
        // let user = context.state.users.find(u => u.login === login);
        let user = _.find(context.state.users, {login});
        if (user) {
          resolve(user)
        } else {
          fetch('http://localhost:3000/api/user/' + login)
              .then((res) => res.json())
              .then((user) => {
                _.unset(user, '_id');
                context.commit('addUser', user);
                resolve(user);
              })
              .catch(() => resolve({ }) );
        }
      });
    },
    updateUser(context, {login, updatedUser}) {
      return new Promise((resolve, reject) => {
        if (!login || !updatedUser.email || !updatedUser.password) {
          return reject('400');
        }
        fetch('http://localhost:3000/api/user/' + login, {
          method: 'put',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
          }),
          body: JSON.stringify(updatedUser)
        })
            .then((res) => {
              if (res.status !== 200) {
                throw new Error(res.status + '');
              }
              context.commit('changeUser', {login, newUser: updatedUser});
              resolve();
            })
            .catch(e => reject(e.message));
      });
    },
    createUser(context, {login, newUser}) {
      return new Promise((resolve, reject) => {
        if (!login || !newUser.email || !newUser.password) {
          return reject('400');
        }
        if (_.find(context.state.users, {login})) {
          return reject('404');
        }
        fetch('http://localhost:3000/api/user/', {
          method: 'post',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
          }),
          body: JSON.stringify(newUser)
        })
            .then((res) => {
              if (res.status !== 200) {
                throw new Error(res.status + '');
              }
              context.commit('addUser', newUser);
              resolve();
            })
            .catch(e => reject(e.message));
      });
    }
  },
});
