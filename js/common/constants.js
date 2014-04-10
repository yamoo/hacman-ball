HAC.define('Const',[
], function() {

	return {
		server: 'http://localhost:33000',
		//server: 'http://VLB12-28:3000',
		storage: 'hacmanball_data_v0.1',
		timeout: 300000,
		world: {
			tile: 32,
			width: 24*32,
			height: 18*32
		},
		mode: {
			secret: 'vip',
			cpu: 'cpu'
		},
		charactor: {
			length: 17
		},
		assets: {
			'chara0': 'img/chara0.png',
			'item0': 'img/item0.png',
			'map0': 'img/map0.png',
			'end': 'img/end.png',
			'snd_end': 'audio/snd_end.mp3',
			'snd_start': 'audio/snd_start.mp3',
			'snd_walk': 'audio/snd_walk.mp3',
			'snd_kick': 'audio/snd_kick.mp3',
			'snd_sick': 'audio/snd_sick.mp3',
			'snd_kill': 'audio/snd_kill.mp3',
			'snd_point': 'audio/snd_point.mp3',
			'snd_item': 'audio/snd_item.mp3'
		},
		message: {
			common: {
				time: '<%= hour %>:<%= minute %>:<%= second %>'
			},
			user: {
				lose: '<b><%= targetName %></b> was killed by <b><%= killerName %></b>.',
				leave: '<b><%= targetName %></b> was left.',
				join: '<b><%= targetName %></b> was joined.'
			},
			error: {
				ie: 'Sorry... I know you love IE, but unfortunately, we do not support IE. Please access via Chrome or Firefox.'
			}
		},
		link: {
			redirect: 'http://www.play.com/'
		}
	};
});