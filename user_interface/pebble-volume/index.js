'use strict';

var fs = require("fs");
var libQ = require("kew");
var exec = require('child_process').exec;
var devname = "/dev/input/event0";
var input = null;

module.exports = PebbleVolumeControl;

function PebbleVolumeControl(context) {
  var self = this;

  this.context = context;
  this.commandRouter = this.context.coreCommand;
  this.logger = this.context.logger;
  this.configManager = this.context.configManager;
  self.debug("PebbleVolumeControl constructor called"); 
}

PebbleVolumeControl.prototype.onVolumioStart = function() {
  var self = this;
  self.debug("onVolumioStart"); 

  var defer = libQ.defer();
}

PebbleVolumeControl.prototype.onStart = function() {

  var self = this;
  self.debug("onStart");

  var defer = libQ.defer();
  if (! input ) {
    input = fs.createReadStream(devname);
  }
  self.setEventHandler();
  return defer.promise;
}

PebbleVolumeControl.prototype.setEventHandler = function() {

  var self = this;
  self.debug("setEventHandler");

  input.on("data", function(buf) {
    // should have Buffer object of length=48
    // otherwize we have wrong device, other than JBL pebble
    if (buf.length == 48) {
      var event = buf.slice(16,32);
      // struct input_event {
      //	 struct timeval time; // 8
      //	 unsigned short type; // 2 
      //	 unsigned short code; // 2
      //   unsigned int value;  // 4
      // };
      var code = event.readInt16LE(10);
      var value = event.readInt32LE(12);
      // event comes twice: value:1 (make) and value:2 (break)
      if (value == 1) { 
        self.debug(event);
        if (code == 0x0072 && value == 1) {
          self.debug("volume minus");
          self.executeCommand("volume minus");
        } else if ( code == 0x0073 && value == 1) {
          self.debug("volume plus");
          self.executeCommand("volume plus");
        }
      }
    } else {
      self.debug("unexpected input: buf.length=", buf.length);
    }
  });
}

PebbleVolumeControl.prototype.onStop = function() {
  var self = this;
  self.debug("onStop closing input");
  input.close();
  input = null;
  return libQ.resolve();
}

PebbleVolumeControl.prototype.executeCommand = function (cmd)
{
  var self = this;
  var defer = libQ.defer();

  exec('/usr/local/bin/volumio ' + cmd, {uid:1000, gid:1000}, function (error, stout, stderr) {
    if(error)
       self.debug(stderr);
    defer.resolve();
  });
  return defer.promise;
}

PebbleVolumeControl.prototype.debug = function (str) {
  var self = this;
  if (self.logger) {
    self.logger.debug(str);
  } 
  console.log(str);
}
