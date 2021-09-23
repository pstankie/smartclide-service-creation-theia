import * as React from 'react';
import { injectable, postConstruct, inject } from 'inversify';
import { AlertMessage } from '@theia/core/lib/browser/widgets/alert-message';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core';
import { TerminalService } from '@theia/terminal/lib/browser/base/terminal-service';
import { CommandService } from '@theia/core/lib/common/command';

@injectable()
export class SmartclideServiceCreationTheiaWidget extends ReactWidget {

    static readonly ID = 'smartclide-service-creation-theia:widget';
    static readonly LABEL = 'Smartclide Service Creation';
	static state = {
		stateServiceURL: '',
		stateName: '',
		stateGitlabURL: '',
		stateGitlabToken: '',
		stateProjectVisibility: '',
		stateDescription: ''
	};
	
    @inject(MessageService)
    protected readonly messageService!: MessageService;

	@inject(TerminalService)
	private readonly terminalService: TerminalService;

	@inject(CommandService)
    protected readonly commandService: CommandService;

    @postConstruct()
    protected async init(): Promise < void> {
        this.id = SmartclideServiceCreationTheiaWidget.ID;
        this.title.label = SmartclideServiceCreationTheiaWidget.LABEL;
        this.title.caption = SmartclideServiceCreationTheiaWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-cogs';
		
        this.update();
    }

    protected render(): React.ReactNode {
        const header = `Provide the GitLab project configuration details.`;
        
		return <div id='widget-container'>
            <AlertMessage type='INFO' header={header} />
            <div id='info'>
				<table>
					<tbody>
					  <tr>
						<td className='cellID'>Service Creation URL</td>
						<td>
							<input onChange={this.updateInput} placeholder='Service' name='stateServiceURL'/>
						</td>
					  </tr>
					  <tr>
						<td className='cellID'>GitLab Server URL</td>
						<td>
							<input onChange={this.updateInput} placeholder='URL' name='stateGitlabURL'/>
						</td>
					  </tr>
					  <tr>
						<td className='cellID'>GitLab Token</td>
						<td>
							<input type='password' onChange={this.updateInput} placeholder='Token' name='stateGitlabToken'/>
						</td>
					  </tr>
					  <tr>
						<td className='cellID'>Project Name</td>
						<td>
							<input onChange={this.updateInput} maxLength={100} placeholder='Name' name='stateName'/>
						</td>
					  </tr>
					  <tr>
						<td className='cellID'>Project Visibility</td>
						<td id='radio_buttons'>
							<input className='inputRadio' type="radio" id="visibility1" name="visibility" value="0" onChange={this.onValueChange}/>
							<label htmlFor="visibility1">public</label>
							<input className='inputRadio' type="radio" id="visibility2" name="visibility" value="1" onChange={this.onValueChange}/>
							<label htmlFor="visibility2">internal</label>
							<input className='inputRadio' type="radio" id="visibility3" name="visibility" value="2" onChange={this.onValueChange}/>
							<label htmlFor="visibility3">private</label>
						</td>
					  </tr>
					  <tr>
						<td className='cellID'>Description</td>
						<td>
							<textarea id="textDescription" onChange={this.updateInputTextArea} rows={2}></textarea>
						</td>
					  </tr>
					</tbody>
				</table>
            </div>
			<button className='theia-button secondary' title='Create' onClick={_a => this.runprocess()}>Run</button>
			<div id='waitAnimation' className="lds-dual-ring"></div>
			<i id='message'></i>
		</div>
    }

    protected runprocess(): void {
		//if all the fields have values
		if(SmartclideServiceCreationTheiaWidget.state.stateServiceURL!='' &&
		   SmartclideServiceCreationTheiaWidget.state.stateName!='' && SmartclideServiceCreationTheiaWidget.state.stateGitlabURL!='' &&
		   SmartclideServiceCreationTheiaWidget.state.stateGitlabToken!='' && SmartclideServiceCreationTheiaWidget.state.stateProjectVisibility!='' &&
		   SmartclideServiceCreationTheiaWidget.state.stateDescription!='' )
		{
			console.log('SmartclideServiceCreationTheiaWidget.state.stateServiceURL: ', SmartclideServiceCreationTheiaWidget.state.stateServiceURL);
			console.log('SmartclideServiceCreationTheiaWidget.state.stateName: ', SmartclideServiceCreationTheiaWidget.state.stateName);
			console.log('SmartclideServiceCreationTheiaWidget.state.stateGitlabURL: ', SmartclideServiceCreationTheiaWidget.state.stateGitlabURL);
			console.log('SmartclideServiceCreationTheiaWidget.state.stateGitlabToken: ', SmartclideServiceCreationTheiaWidget.state.stateGitlabToken);
			console.log('SmartclideServiceCreationTheiaWidget.state.stateProjectVisibility: ', SmartclideServiceCreationTheiaWidget.state.stateProjectVisibility);
			console.log('SmartclideServiceCreationTheiaWidget.state.stateDescription: ', SmartclideServiceCreationTheiaWidget.state.stateDescription);
			
			//waiting animation start
			(document.getElementById("waitAnimation") as HTMLElement).style.display = "block";

			//post request
			fetch(SmartclideServiceCreationTheiaWidget.state.stateServiceURL+'/createStructure', {
				method: 'post',
				headers: {
					'Accept': '*/*',
					'Access-Control-Allow-Origin': '*',
					'projectName' : SmartclideServiceCreationTheiaWidget.state.stateName,
					'gitLabServerURL' : SmartclideServiceCreationTheiaWidget.state.stateGitlabURL,
					'gitlabToken' : SmartclideServiceCreationTheiaWidget.state.stateGitlabToken,
					'projVisibility' : SmartclideServiceCreationTheiaWidget.state.stateProjectVisibility,
					'projDescription' : SmartclideServiceCreationTheiaWidget.state.stateDescription
				}
			}).then(res => res.json())
			  .then((out) => {
					var obj = JSON.parse(JSON.stringify(out));
					
					//waiting animation stop
					(document.getElementById("waitAnimation") as HTMLElement).style.display = "none";

					//show message get from service
					(document.getElementById("message") as HTMLElement).style.display = "block";
					(document.getElementById('message') as HTMLElement).innerHTML = obj.message;
					
					//check post request status
					if (obj.status==0){
						this.messageService.info('Successful Execution');
						
						//Create dir and clone
						(async () => {
							try {
								let terminalWidget = await this.terminalService.newTerminal({});
								await terminalWidget.start();
								await terminalWidget.sendText('mkdir '+SmartclideServiceCreationTheiaWidget.state.stateName+'\r\n');
								await terminalWidget.sendText('cd '+SmartclideServiceCreationTheiaWidget.state.stateName+'\r\n');
								let gitClone= 'git clone https://oauth2:' + SmartclideServiceCreationTheiaWidget.state.stateGitlabToken
													+ '@' + obj.message.replace('https://','');
								await terminalWidget.sendText(gitClone+'\r\n');
								await this.terminalService.open(terminalWidget);

								//go to File Explorer
								this.commandService.executeCommand('workbench.files.action.focusFilesExplorer');
							} catch(e) {
								this.messageService.info('Error in git clone');
							}
						})();
					}
					else{
						this.messageService.info('Error In Execution');
					}
			  })
			  .catch(err => {
				(document.getElementById("waitAnimation") as HTMLElement).style.display = "none";
				console.log('err: ', err);
				(document.getElementById("message") as HTMLElement).style.display = "block";
				(document.getElementById('message') as HTMLElement).innerHTML = 'Error With Service';
			  });
		}
		else{
			(document.getElementById("message") as HTMLElement).style.display = "none";
			this.messageService.info('Provide values for all fields');
		}
    }

	//update the state
	updateInput (e: React.ChangeEvent<HTMLInputElement>) {
		const key =e.currentTarget.name as keyof typeof SmartclideServiceCreationTheiaWidget.state
		SmartclideServiceCreationTheiaWidget.state[key] = e.currentTarget.value;
    }

	//update for text 
	updateInputTextArea (e: React.ChangeEvent<HTMLTextAreaElement>) {
		SmartclideServiceCreationTheiaWidget.state.stateDescription = e.currentTarget.value;
    }

	//update for radio group
	onValueChange(event: React.ChangeEvent<HTMLInputElement>) {
		SmartclideServiceCreationTheiaWidget.state.stateProjectVisibility= event.target.value;
	 }
}
