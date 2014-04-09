HAC.define('BaseMap',[
	'Const',
	'utils',
	'BaseMapData'
], function(Const, utils, BaseMapData) {
    var Hacman;

    BaseMap = enchant.Class.create(enchant.Map, {
        initialize: function(game){
			var mapdata;

            enchant.Map.call(this, Const.world.tile, Const.world.tile);

            mapdata = utils.ascii2map(BaseMapData);
			this.image = game.assets[Const.assets['map0']];
			this.loadData(mapdata.map);
			this.collisionData = mapdata.colMap;
        }
    });

    return BaseMap;
});