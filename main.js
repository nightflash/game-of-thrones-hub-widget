'use strict';

const houses = {
  'Targaryen': {
    moto: 'Fire and Blood',
    text: '#d2391c',
    shadow: '#000'
  },
  'Arryn': {
    moto: 'As High as Honor',
    text: '#d3ceba',
    shadow: '#000'
  },
  'Greyjoy': {
    moto: 'We Do Not Sow',
    text: '#fecc37',
    shadow: '#000'
  },
  'Stark': {
    moto: 'Winter is Coming',
    text: '#000',
    shadow: '#ccc'
  },
  'Baratheon': {
    moto: 'Ours is the Fury',
    text: '#000',
    shadow: 'wheat'
  },
  'Tully': {
    moto: 'Family, Duty, Honor',
    text: '#ccc',
    shadow: '#000'
  },
  'Lannister': {
    moto: 'Hear Me Roar!',
    text: '#f0b52d',
    shadow: 'wheat'
  }
};

class Widget {
  constructor(dashboardApi, registerWidgetApi) {
    this.dashboardApi = dashboardApi;
    this.content = document.getElementById('content');
    this.configuration = document.getElementById('configuration');

    this.configuration.hidden = true;
    this.config = {
      selectedHouse: 'Stark'
    };

    registerWidgetApi({
      onConfigure: () => {
        this.toggleContent();
      }
    });

    this.initialize();
  }

  initialize() {
    this.dashboardApi.readConfig()
        .then(config => {
          this.config = config || this.config;

          this.prepareConfiguration();

          this.render();
          window.setInterval(this.render.bind(this), 1000);
        });
  }

  prepareConfiguration() {
    const select = this.configuration.querySelector('.house-picker');
    const saveBtn = this.configuration.querySelector('.save-button');

    for (let house in houses){
      const opt = document.createElement('option');
      opt.value = house;
      opt.selected = this.config.selectedHouse === house;
      opt.innerHTML = `${house} (${houses[house].moto})`;
      select.appendChild(opt);
    }

    saveBtn.addEventListener('click', () => {
      this.config.selectedHouse = select.value;
      this.dashboardApi.storeConfig(this.config);
      this.toggleContent();
    });
  }

  toggleContent() {
    this.content.hidden = !this.content.hidden;
    this.configuration.hidden = !this.content.hidden;
  }

  render() {
    const plural = (phrase, num) => {
      return num === 1 ? phrase : `${phrase}s`;
    };

    const house = houses[this.config.selectedHouse];
    const date = this.getNewEpisode();

    this.content.querySelector('.counter').style.color = house.text;
    this.content.querySelector('.counter').style.textShadow = `2px 2px ${house.shadow}`;

    for (let key in date) {
      const val = date[key];
      this.content.querySelector(`.${key}`).innerHTML = `<span class="value">${val}</span><span class="description">${plural(key, val)}</span>`;
    }

    this.content.style.backgroundImage = `url('https://www.hbo.com/assets/images/series/game-of-thrones/downloads/wallpaper-${this.config.selectedHouse.toLowerCase()}-1600.jpg')`;
  }

  getNewEpisode() {
    const nextEpisode = () => {
      const d = new Date();
      d.setUTCHours(1, 0, 0, 0);
      d.setUTCDate(d.getUTCDate() + (1 + 7 - d.getUTCDay()) % 7);

      return d;
    };

    let delta = (nextEpisode().getTime() - new Date().getTime()) / 1000;

    const day = Math.floor(delta / 86400);
    delta -= day * 86400;

    const hour = Math.floor(delta / 3600) % 24;
    delta -= hour * 3600;

    const minute = Math.floor(delta / 60) % 60;
    delta -= minute * 60;

    const second = Math.floor(delta % 60);

    return {day, hour, minute, second};
  }
}

Dashboard.registerWidget(Widget);