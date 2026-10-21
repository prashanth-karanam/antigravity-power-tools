Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

nodePath = "C:\Program Files\nodejs\node.exe"
If Not fso.FileExists(nodePath) Then
  nodePath = "node"
End If

strDaemon = WshShell.ExpandEnvironmentStrings("%USERPROFILE%\.gemini\config\power-tools\power_daemon.js")
If Not fso.FileExists(strDaemon) Then
  strDaemon = fso.GetParentFolderName(WScript.ScriptFullName) & "\power_daemon.js"
End If

WshShell.Run """" & nodePath & """ """ & strDaemon & """", 0, False
