import * as React from "react";

import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

import { createRoot } from "react-dom/client";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	eval: boolean;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	eval: false,
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		// this.addSettingTab(new FormSettingTab(this.app, this));
		this.registerMarkdownCodeBlockProcessor(
			"form",
			async (source: string, el) => {
				const root = createRoot(el);
				const PrintInput = () => {
					const match: Array<string> =
						source.match(/^\s*\(?([^\)]*)\)?\s*=/) || [];
					const keys =
						match.length > 1
							? match[1].replace(" ", "").split(",")
							: [];
					if (match.length <= 1) {
						return (
							<p style={{ color: "red" }}>
								Error: an arrow function must be provided with
								one key. Ex: (x) =&gt; x
							</p>
						);
					}
					const [val, setVal] = React.useState<{
						[key: string]: string;
					}>(keys.reduce((acc, key) => ({ ...acc, [key]: "" }), {}));

					let Res;
					try {
						Res = (
							<>
								{keys.map((key) => (
									<>
										<span>{key} </span>
										<input
											type="text"
											value={val[key]}
											onChange={(e) =>
												setVal({
													...val,
													[key]: e.currentTarget
														.value,
												})
											}
										/>
										<br />
									</>
								))}
								<p>
									{Object.values(val).some(
										(v) => `${v}`.length > 0
									) &&
										eval(source)(
											...Object.values(val).map((v) =>
												/^\d+$/.test(v)
													? parseFloat(v)
													: v
											)
										)}
								</p>
							</>
						);
					} catch (e) {
						Res = <p style={{ color: "red" }}>{e.message}</p>;
					}

					return Res;
				};
				root.render(<PrintInput />);
			}
		);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	onunload() {}
}

class FormSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for Obsidian Forms." });

		new Setting(containerEl)
			.setName("Eval")
			.setDesc(
				"Whether or not to evaluate code in the code block. This is unsafe!"
			)
			.addToggle((v) =>
				v.setValue(false).onChange(async (value) => {
					this.plugin.settings.eval = value;
					await this.plugin.saveSettings();
				})
			);
	}
}
