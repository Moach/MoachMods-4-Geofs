geofs.aircraft.instance.setup.minimumSpeed = 150;
geofs.aircraft.instance.setup.engineInertia = .75;
geofs.aircraft.instance.setup.dragFactor = 1;
geofs.aircraft.instance.rigidBody.mass = 55000;
geofs.aircraft.instance.setup.zeroRPMAltitude = 180000;

geofs.aircraft.instance.airfoils[4].dragFactor = 5; // airbrakes
geofs.aircraft.instance.airfoils[8].dragFactor = 5;

geofs.aircraft.instance.airfoils[1].aspectRatio = 9.45; // does this even do anything?
geofs.aircraft.instance.airfoils[5].aspectRatio = 9.45; // flight.tick makes no use of this at all

geofs.aircraft.instance.setup.cameras.cockpit.orientation[1] =-14;

geofs.aircraft.instance.setup.flapsTravelTime = 10;

geofs.m2.hudWarnCfg.warnOverspeed=true;
// AVOID FURTHER TAMPERING!
// power and drag characteristics tuned to match documented performance
// in various flight regimes (based on PMDG, mostly)
// results appear to be within very close tolerances after much tweaking
// try not to breathe too hard near it!

geofs.m2.dragTwk.enable = true;
geofs.m2.dragTwk.baseDrag = 1.4;
geofs.m2.dragTwk.flapsDragScl   = 4.5;
geofs.m2.dragTwk.flapsDragCfg = [0, .25, .32, .40, .50, .75, .80, .90, 1.0];

geofs.m2.powerCurveEnable = true;
geofs.m2.powerCurveLo = 72000; 
geofs.m2.powerCurveHi = 116000;
geofs.m2.powerCurveEprMin = .30;
geofs.m2.powerCurveEprSat = .16;
geofs.m2.powerCurveGrdIdleRPM = 1000;
geofs.m2.powerCurveFltIdleInc = 600;
geofs.m2.powerCurveFltIdleSpc = .01;

geofs.m2.hudEngPerfTag = "N1%";
geofs.m2.hudEngPerfOffset = 20; 
geofs.m2.hudEngPerfScalar = 106; 
geofs.m2.hudEngPerfAltRescale = 1;
geofs.m2.hudEngPerfAltPctRef = 41000;
geofs.m2.hudEngPerfAltPercent = 4;
geofs.m2.hudEngPerfEprPercent = 2.5;
geofs.m2.hudEngPerfFltIdleInc = 12;
geofs.m2.hudEngPerfFltIdleSpc = .008;
geofs.m2.hudEngPerfCrsAdjust = { enable:true, v: .68, u: 1.1, k: .15 };

controls.keyboard.recenterRatio = .12;

geofs.aircraft.instance.controllers.pitch.recenter = true;
geofs.aircraft.instance.controllers.yaw.recenter=true;

geofs.m2.yawDamperGrUpFactor = .1;
geofs.m2.yawDamperGrDnFactor = .3;


geofs.aircraft.instance.engines[0].thrust = 91000;//105000;
geofs.aircraft.instance.engines[1].thrust = 91000;//105000;

//geofs.aircraft.instance.parts.flaps_indicator.animations[0].ratio = -1.075;




geofs.m2.turnCoordSensitivity = 4;
geofs.m2.rudderReCtrMaxBank = 8;

geofs.m2.ctrlDSensMinTAS = 100;
geofs.m2.ctrlDSensMaxTAS = 280;
geofs.m2.ctrlDSensNominal =  1.5;
geofs.m2.ctrlDSensSoftest = .05;
geofs.m2.ctrlDSensTouchdn = 3.0;  
geofs.m2.ctrlDSensTaxiing = 1.5;  


geofs.m2.mpTagRangeMax=50000;
geofs.m2.mpTagRangeMed=20000;

geofs.aircraft.instance.parts["front_wheels"].animations[0].ratio = 2;
geofs.aircraft.instance.parts["wheels_left" ].animations[0].ratio = 1.5;
geofs.aircraft.instance.parts["wheels_right"].animations[0].ratio = 1.5;

geofs.trblFrq = .65;
geofs.trblOff = .15;
geofs.trblPwr = 600;

geofs.aircraft.instance.setup.cameras.cockpit.position[2] = 1.33;
geofs.aircraft.instance.setup.cameras.cockpit.position[1] = 14.64;

camera.currentDefinition.position[2] = geofs.aircraft.instance.setup.cameras.cockpit.position[2];
camera.currentDefinition.position[1] = geofs.aircraft.instance.setup.cameras.cockpit.position[1];

camera.definitions.cockpit.FOV=1.4;
geofs.aircraft.instance.setup.cameras.cockpit.FOV=1.4;

instruments.list.pfd.definition.cockpit.position = [-.494,15.242,.941];
instruments.list.pfd.definition.cockpit.scale = 1.165;

instruments.list.pfd.overlay.children[1].definition.animations[0].value="kcas";
instruments.list.pfd.overlay.children[1].definition.animations[0].ratio=2.125;

instruments.list.rpmJet.overlay.children[1].definition.animations[0].value="rpmPct";
instruments.list.rpmJet.overlay.children[1].definition.animations[0].ratio=-2.7;
instruments.list.rpmJet.overlay.children[0].definition.animations[0].value="rpmPct";
instruments.list.rpmJet.overlay.children[0].definition.animations[0].ratio=-36.0;


instruments.list.pfd.overlay.children[10].definition.scale.x = 1.5;
instruments.list.pfd.overlay.children[10].definition.scale.y = 1.5;
instruments.list.pfd.overlay.children[10].definition.position.x=-56;
instruments.list.pfd.overlay.children[10].definition.position.y=-55;


geofs.aircraft.instance.setup.startupTime = 12.5;
audio.sounds.rpm1.effects.volume.ramp = [600,    900,      10000, 20000];
audio.sounds.rpm2.effects.volume.ramp = [400,    1000,    52000, 52000];
audio.sounds.rpm3.effects.volume.ramp = [200,    20000,    20000, 20000];

audio.sounds.rpm1.effects.pitch.ramp = [0, 10000, 20000, 20000];
audio.sounds.rpm2.effects.pitch.ramp = [0, 20000, 20000, 20000];
audio.sounds.rpm3.effects.pitch.ramp = [0, 20000, 20000, 20000];

audio.sounds.rpm1.effects.volume.ratio =  100;
audio.sounds.rpm1.effects.pitch.offset =  .65; //.65
audio.sounds.rpm1.effects.pitch.ratio  =  1.0; //.75

audio.sounds.rpm2.effects.volume.ratio =  100;
audio.sounds.rpm2.effects.pitch.offset = 1.20; // 1.25
audio.sounds.rpm2.effects.pitch.ratio  = 3.00; //1.25;

audio.sounds.rpm3.effects.pitch.ratio = 1.0;
audio.sounds.rpm3.effects.pitch.offset = .75;
audio.sounds.rpm3.effects.volume.ratio = 50;

geofs.aircraft.instance.airfoils[13].animations[0].ratio = -27; // rudder
geofs.aircraft.instance.airfoils[11].animations[0].ratio = 25; // elev L
geofs.aircraft.instance.airfoils[12].animations[0].ratio = 25; // elev R

geofs.aircraft.instance.setup.contactProperties.wheel.rollingFriction=.000001;
geofs.aircraft.instance.setup.contactProperties.wheel.dynamicFriction=.005;
geofs.aircraft.instance.setup.contactProperties.wheel.frictionCoef=45;

geofs.aircraft.instance.wheels[0].suspension.damping = 1.00;
geofs.aircraft.instance.wheels[1].suspension.damping = 1.00;
geofs.aircraft.instance.wheels[2].suspension.damping =  .40;

geofs.aircraft.instance.wheels[0].suspension.stiffness=55;
geofs.aircraft.instance.wheels[1].suspension.stiffness=55;
geofs.aircraft.instance.wheels[2].suspension.stiffness=8;



geofs.aircraft.instance.parts.outboard_flap_left_2.animations[1].ratio=-.008;
geofs.aircraft.instance.parts.outboard_flap_left_2.animations[1].max=5;
geofs.aircraft.instance.parts.outboard_flap_right_2.animations[1].ratio=-.008;
geofs.aircraft.instance.parts.outboard_flap_right_2.animations[1].max=5;

geofs.aircraft.instance.parts.inboard_flap_left_2.animations[1].ratio=-.01;
geofs.aircraft.instance.parts.inboard_flap_left_2.animations[1].max=5;
geofs.aircraft.instance.parts.inboard_flap_right_2.animations[1].ratio=-.01;
geofs.aircraft.instance.parts.inboard_flap_right_2.animations[1].max=5;

geofs.aircraft.instance.parts.inboard_flap_left_2.animations[0].ratio = -1;
geofs.aircraft.instance.parts.inboard_flap_left_2.animations[0].max = 18;
geofs.aircraft.instance.parts.inboard_flap_right_2.animations[0].ratio = -1;
geofs.aircraft.instance.parts.inboard_flap_right_2.animations[0].max = 18;

geofs.aircraft.instance.parts.outboard_flap_left_2.animations[0].ratio = -.8;
geofs.aircraft.instance.parts.outboard_flap_left_2.animations[0].max = 35;
geofs.aircraft.instance.parts.outboard_flap_right_2.animations[0].ratio = -.8;
geofs.aircraft.instance.parts.outboard_flap_right_2.animations[0].max = 35;

geofs.aircraft.instance.parts.outboard_flap_left_1.animations[1].ratio=-.006;
geofs.aircraft.instance.parts.outboard_flap_left_1.animations[1].max=20;
geofs.aircraft.instance.parts.outboard_flap_right_1.animations[1].ratio=-.006;
geofs.aircraft.instance.parts.outboard_flap_right_1.animations[1].max=20;

geofs.aircraft.instance.parts.inboard_flap_left_1.animations[1].ratio=-.006;
geofs.aircraft.instance.parts.inboard_flap_left_1.animations[1].max=20;
geofs.aircraft.instance.parts.inboard_flap_right_1.animations[1].ratio=-.006;
geofs.aircraft.instance.parts.inboard_flap_right_1.animations[1].max=20;

geofs.aircraft.instance.parts.inboard_flap_right_1.animations[2].ratio = -.0012
geofs.aircraft.instance.parts.inboard_flap_right_1.animations[2].max = 15;
geofs.aircraft.instance.parts.inboard_flap_left_1.animations[2].ratio = -.0012
geofs.aircraft.instance.parts.inboard_flap_left_1.animations[2].max = 15;

geofs.aircraft.instance.parts.outboard_flap_left_1.animations[2].ratio = -.0012
geofs.aircraft.instance.parts.outboard_flap_left_1.animations[2].max = 20;
geofs.aircraft.instance.parts.outboard_flap_right_1.animations[2].ratio = -.0012
geofs.aircraft.instance.parts.outboard_flap_right_1.animations[2].max = 20;


geofs.aircraft.instance.parts.flap_faring_right_1.animations[0].ratio = -.8
geofs.aircraft.instance.parts.flap_faring_left_1.animations[0].ratio = -.8
geofs.aircraft.instance.parts.flap_faring_right_2.animations[0].ratio = -.8
geofs.aircraft.instance.parts.flap_faring_left_2.animations[0].ratio = -.8


geofs.aircraft.instance.parts.slat_left.animations[0].ratio = 10;
geofs.aircraft.instance.parts.slat_left.animations[0].max  = 1.5;
geofs.aircraft.instance.parts.slat_left.animations[1].max = .003;
geofs.aircraft.instance.parts.slat_left.animations[1].ratio = 10;

geofs.aircraft.instance.parts.slat_right.animations[0].ratio = 10;
geofs.aircraft.instance.parts.slat_right.animations[0].max  = 1.5;
geofs.aircraft.instance.parts.slat_right.animations[1].max = .003;
geofs.aircraft.instance.parts.slat_right.animations[1].ratio = 10;

//geofs.m2.yawDamperSet = 13; // rudder airfoil index
//geofs.m2.yawDamperRng = [-20, -5];

/*
geofs.aircraft.instance.wheels[0].contact.collisionPoint.contactProperties.dynamicFriction = 1;
geofs.aircraft.instance.wheels[1].contact.collisionPoint.contactProperties.dynamicFriction = 1;
geofs.aircraft.instance.wheels[2].contact.collisionPoint.contactProperties.dynamicFriction = 1;
geofs.aircraft.instance.wheels[0].contact.collisionPoint.contactProperties.frictionCoef = 20;
geofs.aircraft.instance.wheels[1].contact.collisionPoint.contactProperties.frictionCoef = 25;
geofs.aircraft.instance.wheels[2].contact.collisionPoint.contactProperties.frictionCoef = 25;
//
*/
