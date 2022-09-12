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
		this.addSettingTab(new FormSettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor(
			"form",
			async (source: string, el) => {
				const root = createRoot(el);
				const PrintInput = () => {
					const myFunc = eval(source);
					const match: Array<string> =
						source.match(/^\s*\(([^\)]*)\)/) || [];
					const keys =
						match.length > 1
							? match[1].replace(" ", "").split(",")
							: [];

					const [val, setVal] = React.useState<{
						[key: string]: string;
					}>(keys.reduce((acc, key) => ({ ...acc, [key]: "" }), {}));

					return (
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
												[key]: e.currentTarget.value,
											})
										}
									/>
									<br />
								</>
							))}
							<p>
								{myFunc(
									...Object.values(val).map((v) =>
										/^\d+$/.test(v) ? parseFloat(v) : v
									)
								)}
							</p>
						</>
					);
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
