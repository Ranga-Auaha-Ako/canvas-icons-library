const path = require('node:path');

// Compiles the library of icons into:
// - a single file icon font for use outside Canvas
// - A JSON file referencing icons and font codes
// - Assets for each icon
// - Lambda script for transforming icons on-demand

module.exports = function (grunt) {
	// Project configuration.
	grunt.initConfig({
		// Generate IconFont
		svg_sprite: {
			options: {
				// Task-specific options go here.
				// log: 'debug',
				shape: {
					id: {
						generator(iconPath, file) {
							const { name, dir } = path.parse(iconPath);
							const folders = dir.split(path.sep);
							const id =
								folders.join('--').replace(/[\s_\-\.]/gi, '-') +
								'--' +
								name.replace(/[\s_\-\.]/gi, '-');
							return id;
						}
					},
					spacing: {
						padding: 0,
						box: 'icon'
					},
					transform: [
						{
							svgo: {
								// V3.0.2 schema
								plugins: [
									'removeStyleElement',
									'removeScriptElement',
									{
										name: 'unsetColours',
										// type: 'perItem',
										fn: (node) => {
											return {
												element: {
													enter: (node, parentNode) => {
														if (node.name === 'svg') {
															node.attributes.fill = 'currentColor';
														}
													}
												}
											};
										}
									}
								]
							}
						}
					]
				},
				mode: {
					css: {
						example: false,
						render: {
							css: true
						},
						bust: false
					},
					view: {
						example: false,
						render: {
							css: true
						},
						bust: false
					},
					stack: {
						// Stack is the one used by the web app to display icons efficiently
						example: false,
						render: {
							css: true
						},
						bust: false
					},
					defs: {
						// Defs allows <use> tags to reference icons, which fixes Firefox issues
					}
					// symbol: true,
					// stack: true
				}
			},
			icons: {
				// Target-specific file lists and/or options go here.
				expand: true,
				cwd: 'dist/icons',
				src: ['**/*.svg'],
				dest: 'dist/font/'
			}
		},
		// Build editor package
		'npm-command': {
			editor: {
				options: {
					cmd: 'run',
					args: ['build'],
					cwd: 'editor/'
				}
			}
		},
		copy: {
			iconMeta: {
				files: [{ expand: true, cwd: 'icons', src: ['**/*.json'], dest: 'dist/icons/' }]
			}
		},
		svgmin: {
			options: {
				full: true, // Have to do this otherwise order is wrong
				plugins: [
					// DEFAULT
					{ name: 'cleanupAttrs' },
					{ name: 'removeDoctype' },
					{ name: 'removeXMLProcInst' },
					{ name: 'removeComments' },
					{ name: 'removeMetadata' },
					{ name: 'removeTitle' },
					{ name: 'removeDesc' },
					{ name: 'removeUselessDefs' },
					{ name: 'removeEditorsNSData' },
					{ name: 'removeEmptyAttrs' },
					{ name: 'removeHiddenElems' },
					{ name: 'removeEmptyText' },
					{ name: 'removeEmptyContainers' },
					{ name: 'removeViewBox' },
					{ name: 'cleanupEnableBackground' },
					{ name: 'minifyStyles' },
					{ name: 'convertColors' },
					{ name: 'convertPathData' },
					{ name: 'convertTransform' },
					{ name: 'removeUnknownsAndDefaults' },
					{ name: 'removeNonInheritableGroupAttrs' },
					{ name: 'removeUselessStrokeAndFill' },
					{ name: 'removeUnusedNS' },
					{ name: 'cleanupIds' },
					{ name: 'cleanupNumericValues' },
					{ name: 'moveElemsAttrsToGroup' },
					{ name: 'moveGroupAttrsToElems' },
					{ name: 'collapseGroups' },
					{ name: 'mergePaths' },
					{ name: 'convertShapeToPath' },
					{ name: 'convertEllipseToCircle' },
					{ name: 'sortDefsChildren' },
					// CUSTOM
					{ name: 'removeDimensions' },
					{
						name: 'inlineStyles',
						props: { onlyMatchedOnce: false }
					},
					{ name: 'convertStyleToAttrs' },
					{
						name: 'unsetColours',
						fn: (node) => {
							return {
								element: {
									enter: (node, parentNode) => {
										props = ['fill', 'stroke', 'color'];
										props.forEach((prop) => {
											const attr = node.attributes[prop];
											if (attr) {
												if (
													![
														'transparent',
														'none',
														'#0000',
														'#00000000',
														'#fff',
														'#ffffff',
														'white'
													].includes(attr)
												) {
													// Node isn't transparent or white, so make it currentcolour (black)
													node.attributes[prop] = 'currentColor';
												} else {
													// Node is transparent or white, so set it to none to remove useless white
													node.attributes[prop] = 'none';
												}
											}
										});
										if (node.name === 'svg') {
											node.attributes['fill'] = 'currentColor';
											node.attributes['color'] = '#000';
										}
										return node;
									}
								}
							};
						}
					}
				]
			},
			dist: {
				files: [{ expand: true, cwd: 'icons', src: ['**/*.svg'], dest: 'dist/icons/' }]
			}
		},
		compress: {
			options: {
				mode: 'zip',
				archive: 'dist/lambda.zip'
			},
			lambda: {
				files: [{ expand: true, cwd: 'lambda/', src: ['**'], dest: '' }]
			}
		}
	});

	// Load the plugin that compiles the icons into a single file (icon font/svg stack)
	grunt.loadNpmTasks('grunt-svg-sprite');
	// Load the plugin that runs the NPM command to build the editor
	grunt.loadNpmTasks('grunt-npm-command');
	// Load the plugin that copies built editor files to the dist directory
	grunt.loadNpmTasks('grunt-contrib-copy');
	// Compress the Lambda script
	grunt.loadNpmTasks('grunt-contrib-compress');
	// Minifiy SVG files
	grunt.loadNpmTasks('grunt-svgmin');

	// Compile category JSONs into a single file
	grunt.registerTask('build-meta', function () {
		const categories = [];
		// Get list of meta files
		const files = grunt.file.expand({ cwd: 'icons' }, '**/meta.json');
		// Loop over them, and add them to the categories array
		files.forEach((file) => {
			const category = path.dirname(file).split(path.sep).pop();
			const { icons } = grunt.file.readJSON(`icons/${file}`);
			// Loop over icons, adding folder prefix to url
			icons.forEach((icon) => {
				icon.url = `${category}/${icon.url}`;
			});
			categories.push({
				name: category,
				icons
			});
		});
		grunt.file.write('dist/meta.json', JSON.stringify(categories));
	});

	// Default task(s).
	grunt.registerTask('icons', ['svgmin', 'svg_sprite', 'build-meta', 'copy:iconMeta']);
	grunt.registerTask('editor', ['npm-command', 'copy']);
	grunt.registerTask('lambda', ['compress:lambda']);
	grunt.registerTask('default', ['icons', 'editor', 'lambda']);
};
