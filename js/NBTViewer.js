(function(global, undefined) {

    var NBTType = {
        TAG_END        : 0,
        TAG_BYTE       : 1,
        TAG_SHORT      : 2,
        TAG_INT        : 3,
        TAG_LONG       : 4,
        TAG_FLOAT      : 5,
        TAG_DOUBLE     : 6,
        TAG_BYTE_ARRAY : 7,
        TAG_STRING     : 8,
        TAG_LIST       : 9,
        TAG_COMPOUND   : 10
    }
           
    var NBTParser = function (buf) {
        this.buf = buf;
        this.offset = 0;
        
        if(this.buf[this.offset] !== NBTType.TAG_COMPOUND) {
            throw 'Invalid NBT file';
        }
        
        this.root = this.parseTag();
    }

    NBTParser.prototype.parseTag = function () {
        var data = {};
    
        data.type = this.buf[this.offset++];
        data.name = this.parseString();
        data.raw_offset = this.offset;
        data.value = this.parse(data.type);
    
        return data;
    }

    NBTParser.prototype.parse = function (type) {
        var value;
        switch(type) {
            case NBTType.TAG_BYTE:
                value = this.parseByte();
                break;
            case NBTType.TAG_SHORT:
                value = this.parseShort();
                break;
            case NBTType.TAG_INT:
                value = this.parseInt();
                break;
            case NBTType.TAG_LONG:
                value = this.parseLong();
                break;
            case NBTType.TAG_FLOAT:
                value = this.parseFloat();
                break;
            case NBTType.TAG_DOUBLE:
                value = this.parseDouble();
                break;
            case NBTType.TAG_BYTE_ARRAY:
                value = this.parseByteArray();
                break;
            case NBTType.TAG_STRING:
                value = this.parseString();
                break;
            case NBTType.TAG_LIST:
                value = this.parseList();
                break;
            case NBTType.TAG_COMPOUND:
                value = this.parseCompound();
                break;
            default:
                throw 'Invalid NBT type!'
        }
        return value;
    }
    
    NBTParser.prototype.parseByte = function () {
        return this.buf[this.offset++];
    }

    NBTParser.prototype.parseShort = function() {
        var view = new DataView(this.buf.buffer, this.offset);
        this.offset += 2;
        return view.getUint16(0, false);
    }

    NBTParser.prototype.parseInt = function() {
        var view = new DataView(this.buf.buffer, this.offset);
        this.offset += 4;
        return view.getUint32(0, false);
    }

    NBTParser.prototype.parseLong = function () {
        return this.parseByteArray(8); /* TODO */
    }

    NBTParser.prototype.parseFloat = function() {
        var view = new DataView(this.buf.buffer, this.offset);
        this.offset += 4;
        return view.getFloat32(0, false);
    }

    NBTParser.prototype.parseDouble = function() {
        var view = new DataView(this.buf.buffer, this.offset);
        this.offset += 8;
        return view.getFloat64(0, false);
    }

    NBTParser.prototype.parseByteArray = function(length) {
        if(!length) {
            length = this.parseInt();
        }
    
        var view = new Uint8Array(this.buf, this.offset, length);
        this.offset += length;
        return view;
    }

    NBTParser.prototype.parseString = function() {
        var length = this.parseShort();
        var string = '';
        /* TODO not utf-8 */
        for(var i=0; i<length; i++) {
            string += (String.fromCharCode(this.buf[this.offset+i]));
        }
        this.offset += length;
        return string;
    }

    NBTParser.prototype.parseList = function () {
        var list = [];
        var type = this.buf[this.offset++];
        var length = this.parseInt();
        
        for(var i=0; i<length; i++) {
            list[i] = this.parse(type)
        }
        
        return {
            type : type,
            list : list
        };
    }

    NBTParser.prototype.parseCompound = function () {
        var compound = {};
        
        while(this.buf[this.offset] !== NBTType.TAG_END) {
            var tag = this.parseTag();
            compound[tag.name] = tag;
        }
        
        this.offset++;

        return compound;
    }
    
    NBTParser.prototype.writeValue = function (tag, value) {
        var view = new DataView(this.buf.buffer);
        switch(tag.type) {
            case NBTType.TAG_BYTE:
                tag.value = value;
                view.setUint8(tag.raw_offset, value);
                break;
            case NBTType.TAG_SHORT:
                tag.value = value;
                view.setUint16(tag.raw_offset, value, false);
                break;
            case NBTType.TAG_INT:
                tag.value = value;
                view.setUint32(tag.raw_offset, value, false);
                break;
            case NBTType.TAG_LONG:
                throw 'Writing TAG_LONG is not supportet yet!';
            case NBTType.TAG_FLOAT:
                tag.value = value;
                view.setFloat32(tag.raw_offset, value, false);
                break;
            case NBTType.TAG_DOUBLE:
                tag.value = value;
                view.setFloat64(tag.raw_offset, value, false);
                break;
            case NBTType.TAG_BYTE_ARRAY:
                throw 'Writing TAG_BYTE_ARRAY is not supportet yet!';
            case NBTType.TAG_STRING:
                throw 'Writing TAG_STRING is not supportet yet!';
            case NBTType.TAG_LIST:
                throw 'Writing TAG_LIST is not supportet yet!';
            case NBTType.TAG_COMPOUND:
                throw 'Writing TAG_COMPOUND is not supportet yet!';
            default:
                throw 'Invalid TAG type';
        }
    }
    

    var NBTViewer = function (buf) {
        if(!(buf instanceof Uint8Array)) {
            buf = new Uint8Array(buf);
        }
        
        this.parser = new NBTParser(buf);
    }

    NBTViewer.prototype.getRootTag = function () {
        return this.parser.root;
    }
    
    NBTViewer.prototype.getBuffer = function () {
        return this.parser.buf;
    }

    NBTViewer.prototype.getName = function (tag) {
        return tag.name;
    }
    
    NBTViewer.prototype.getType = function (tag) {
        return tag.type;
    }
    
    NBTViewer.prototype.getValue = function (tag) {
        return tag.value;
    }
    
    NBTViewer.prototype.setValue = function (tag, value) {
        this.parser.writeValue(tag, value);
    }

    global.NBTViewer = NBTViewer;
    global.NBTType = NBTType;
}(this));

