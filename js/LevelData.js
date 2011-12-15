(function(global, undefined) {
    var LevelData = function (data) {
        this.gzip = require('gzip-js');
        
        try {
            data = this.gzip.unzip(new Uint8Array(data));
            this.nbt = new NBTViewer(data);
            
            
            var tag = this.nbt.getRootTag();
            tag = this.nbt.getValue(tag);
            tag = this.nbt.getValue(tag['Data']);
            
            if(!tag.GameType || !tag.LevelName) {
                throw new Error();
            }
            
            this.dataTag = tag;
        } catch (err) {
            throw new Error('The selected file is not a valid '+
                             '<tt>level.dat</tt> file. Please make sure that '+
                             'you are using Minecraft Beta 1.8 (or higher) in '+
                             'single player mode');
        }
    }

    LevelData.prototype.getGameType = function () {
        return this.nbt.getValue(this.dataTag.GameType);
    }
    
    LevelData.prototype.setGameType = function (value) {
        if(value !== 0 && value !== 1) {
            throw new Error('Invalid GameMode');
        }
        return this.nbt.setValue(this.dataTag.GameType, value);
    }
    
    LevelData.prototype.getLevelName = function () {
        return this.nbt.getValue(this.dataTag.LevelName);
    }
    
    LevelData.prototype.createBlob = function () {
        var bb = new BlobBuilder();
        var data = this.nbt.getBuffer();
        data = this.gzip.zip(data, { 
            os: 'fat',
            name: 'level.dat',
            level: 1 /* workaround */
        });

        data = new Uint8Array(data);
        bb.append(data.buffer);
        return bb.getBlob('application/x-gzip');
    }
    
    global.LevelData = LevelData;
}(this));
